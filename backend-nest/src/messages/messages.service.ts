import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  private diffForHumans(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  }

  private formatDateTime(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const m = months[date.getMonth()];
    const d = String(date.getDate()).padStart(2, '0');
    const y = date.getFullYear();
    let hr = date.getHours();
    const ampm = hr >= 12 ? 'PM' : 'AM';
    hr = hr % 12;
    hr = hr ? hr : 12;
    const min = String(date.getMinutes()).padStart(2, '0');
    
    return `${m} ${d}, ${y} ${hr}:${min} ${ampm}`;
  }

  async index(user: any) {
    const whereClause: any = {};
    if (user.role !== 'admin') {
      whereClause.OR = [
        { sender_id: user.id },
        { receiver_id: user.id },
      ];
    }

    const latestMessages = await this.prisma.messages.findMany({
      where: whereClause,
      distinct: ['conversation_id'],
      orderBy: [{ conversation_id: 'asc' }, { created_at: 'desc' }],
      include: {
        users_messages_sender_idTousers: true,
        users_messages_receiver_idTousers: true,
      },
    });

    // Sort in-memory to get chronological order (descending by created_at)
    latestMessages.sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA;
    });

    const threads = latestMessages.map((msg) => {
      const partner = msg.sender_id === user.id ? msg.users_messages_receiver_idTousers : msg.users_messages_sender_idTousers;
      const partnerName = partner ? partner.name : 'General User';
      const partnerRole = partner ? partner.role : 'user';

      return {
        conversationId: msg.conversation_id,
        name: partnerName,
        role: partnerRole,
        subject: msg.subject || 'Inquiry',
        lastMessage: msg.text,
        timestamp: msg.created_at ? this.diffForHumans(msg.created_at) : 'some time ago',
        unread: msg.status === 'sent' && msg.receiver_id === user.id,
        tag: partnerRole === 'admin' ? 'admin' : partnerRole === 'organization' ? 'organization' : 'users',
      };
    });

    return {
      success: true,
      threads,
    };
  }

  async show(conversationId: string, user: any) {
    const messages = await this.prisma.messages.findMany({
      where: {
        conversation_id: conversationId,
      },
      include: {
        users_messages_sender_idTousers: true,
        message_attachments: true,
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    // Mark incoming messages as read
    await this.prisma.messages.updateMany({
      where: {
        conversation_id: conversationId,
        receiver_id: user.id,
        status: 'sent',
      },
      data: {
        status: 'read',
      },
    });

    const formatted = messages.map((msg) => ({
      id: msg.id,
      senderId: msg.sender_id,
      senderName: msg.users_messages_sender_idTousers ? msg.users_messages_sender_idTousers.name : 'System',
      senderRole: msg.users_messages_sender_idTousers ? msg.users_messages_sender_idTousers.role : 'user',
      text: msg.text,
      status: msg.status,
      timestamp: msg.created_at ? this.formatDateTime(msg.created_at) : '',
      attachments: msg.message_attachments.map((att) => ({
        id: att.id,
        filePath: att.file_path,
        fileName: att.file_name,
      })),
    }));

    return {
      success: true,
      messages: formatted,
    };
  }

  async store(createMessageDto: CreateMessageDto, file: Express.Multer.File | undefined, user: any) {
    const { conversation_id, text, subject } = createMessageDto;

    let receiverId: bigint | null = null;
    if (createMessageDto.receiver_id) {
      receiverId = BigInt(createMessageDto.receiver_id);
    } else {
      // Find receiver from previous messages in the conversation thread
      const otherMessage = await this.prisma.messages.findFirst({
        where: {
          conversation_id,
          sender_id: { not: user.id },
        },
      });

      if (otherMessage) {
        receiverId = otherMessage.sender_id;
      } else {
        // Fallback to first admin
        const adminUser = await this.prisma.users.findFirst({
          where: { role: 'admin' },
        });
        receiverId = adminUser ? adminUser.id : null;
      }
    }

    const message = await this.prisma.messages.create({
      data: {
        conversation_id,
        sender_id: user.id,
        receiver_id: receiverId,
        subject: subject || null,
        text,
        status: 'sent',
      },
    });

    // Handle attachment
    if (file) {
      const url = await this.cloudinary.upload(file, 'chat/attachments');
      if (url) {
        await this.prisma.message_attachments.create({
          data: {
            message_id: message.id,
            file_path: url,
            file_name: file.originalname,
          },
        });
      }
    }

    const completedMessage = await this.prisma.messages.findUnique({
      where: { id: message.id },
      include: { message_attachments: true },
    });

    const formatted = {
      id: completedMessage!.id,
      senderId: completedMessage!.sender_id,
      senderName: user.name,
      senderRole: user.role,
      text: completedMessage!.text,
      status: completedMessage!.status,
      timestamp: completedMessage!.created_at ? this.formatDateTime(completedMessage!.created_at) : '',
      attachments: completedMessage!.message_attachments.map((att) => ({
        id: att.id,
        filePath: att.file_path,
        fileName: att.file_name,
      })),
    };

    return {
      success: true,
      message: completedMessage,
      formatted,
    };
  }
}
