import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateConventionDto } from './dto/create-convention.dto';
import { UpdateConventionDto } from './dto/update-convention.dto';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { CreateSpeakerDto } from './dto/create-speaker.dto';
import { UpdateSpeakerDto } from './dto/update-speaker.dto';

@Injectable()
export class ConventionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
    private readonly supabase: SupabaseService,
  ) {}

  private toDateOnly(value: Date | string): Date {
    const d = new Date(value);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }

  private validateDateRange(startDate: Date | string, endDate: Date | string) {
    const start = this.toDateOnly(startDate);
    const end = this.toDateOnly(endDate);
    if (start > end) {
      throw new BadRequestException('End date must be on or after the start date.');
    }
  }

  private validateScheduleDate(
    convention: { start_date: Date; end_date: Date },
    scheduleDate: Date | string,
  ) {
    const start = this.toDateOnly(convention.start_date);
    const end = this.toDateOnly(convention.end_date);
    const schedule = this.toDateOnly(scheduleDate);

    if (schedule < start || schedule > end) {
      throw new BadRequestException(
        'Schedule date must fall within the convention start and end dates.',
      );
    }
  }

  private async getConventionOrThrow(id: string) {
    const convention = await this.prisma.convention.findUnique({ where: { id } });
    if (!convention) {
      throw new NotFoundException(`Convention with ID ${id} not found.`);
    }
    return convention;
  }

  private validateImageFile(file: Express.Multer.File) {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPG, JPEG, PNG, and WEBP are allowed.');
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('Image size exceeds the 5MB limit.');
    }
  }

  private validatePdfFile(file: Express.Multer.File) {
    if (!file.mimetype.includes('pdf')) {
      throw new BadRequestException('Only PDF files are allowed.');
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('PDF size exceeds the 10MB limit.');
    }
  }

  private getPublicIdFromUrl(url: string | null): string | null {
    if (!url || !url.includes('cloudinary.com')) return null;
    try {
      const parts = url.split('/upload/');
      if (parts.length < 2) return null;
      const pathParts = parts[1].split('/');
      if (pathParts[0].startsWith('v') && /^\d+$/.test(pathParts[0].substring(1))) {
        pathParts.shift();
      }
      const pathWithoutVersion = pathParts.join('/');
      const lastDotIndex = pathWithoutVersion.lastIndexOf('.');
      if (lastDotIndex === -1) return pathWithoutVersion;
      return pathWithoutVersion.substring(0, lastDotIndex);
    } catch {
      return null;
    }
  }

  async findAll(status?: string) {
    const where: Record<string, string> = {};
    if (status) {
      where.status = status;
    }

    const records = await this.prisma.convention.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    return {
      success: true,
      data: records,
      message: 'Conventions retrieved successfully.',
    };
  }

  async findOne(id: string) {
    const record = await this.getConventionOrThrow(id);

    return {
      success: true,
      data: record,
      message: 'Convention retrieved successfully.',
    };
  }

  async findFull(id: string) {
    const record = await this.prisma.convention.findUnique({
      where: { id },
      include: {
        schedules: { orderBy: [{ schedule_date: 'asc' }, { start_time: 'asc' }] },
        speakers: { orderBy: { created_at: 'asc' } },
        attachments: { orderBy: { created_at: 'asc' } },
      },
    });

    if (!record) {
      throw new NotFoundException(`Convention with ID ${id} not found.`);
    }

    return {
      success: true,
      data: record,
      message: 'Convention with full details retrieved successfully.',
    };
  }

  async create(
    dto: CreateConventionDto,
    user: { id: bigint },
    ipAddress: string,
  ) {
    this.validateDateRange(dto.start_date, dto.end_date);

    const status = dto.status ?? 'draft';
    const publishedAt = status === 'published' ? new Date() : null;

    const attachmentsData =
      dto.attachments?.length
        ? {
            create: dto.attachments.map((a) => ({
              file_url: a.file_url!,
              file_name: a.file_name!,
              file_type: a.file_type!,
            })),
          }
        : undefined;

    if (dto.attachments?.length) {
      for (const attachment of dto.attachments) {
        if (!attachment.file_url || !attachment.file_name || !attachment.file_type) {
          throw new BadRequestException(
            'Each attachment must include file_url, file_name, and file_type.',
          );
        }
        if (!['image', 'pdf'].includes(attachment.file_type)) {
          throw new BadRequestException('Attachment file_type must be image or pdf.');
        }
      }
    }

    const record = await this.prisma.convention.create({
      data: {
        convention_number: dto.convention_number,
        title: dto.title,
        description: dto.description,
        location: dto.location,
        start_date: new Date(dto.start_date),
        end_date: new Date(dto.end_date),
        status,
        created_by: user.id,
        updated_by: user.id,
        published_at: publishedAt,
        attachments: attachmentsData,
      },
      include: { attachments: true },
    });

    await this.logActivity(user.id, 'convention_created', ipAddress);

    return {
      success: true,
      data: record,
      message: 'Convention created successfully.',
    };
  }

  async update(
    id: string,
    dto: UpdateConventionDto,
    user: { id: bigint },
    ipAddress: string,
  ) {
    const existing = await this.getConventionOrThrow(id);

    const startDate = dto.start_date ? new Date(dto.start_date) : existing.start_date;
    const endDate = dto.end_date ? new Date(dto.end_date) : existing.end_date;
    this.validateDateRange(startDate, endDate);

    const newStatus = dto.status ?? existing.status;
    let publishedAt = existing.published_at;
    if (dto.status === 'published' && existing.status !== 'published') {
      publishedAt = new Date();
    } else if (dto.status === 'draft' && existing.status !== 'draft') {
      publishedAt = null;
    }

    const record = await this.prisma.convention.update({
      where: { id },
      data: {
        convention_number: dto.convention_number ?? existing.convention_number,
        title: dto.title ?? existing.title,
        description: dto.description ?? existing.description,
        location: dto.location ?? existing.location,
        start_date: startDate,
        end_date: endDate,
        status: newStatus,
        updated_by: user.id,
        published_at: publishedAt,
      },
    });

    await this.logActivity(user.id, 'convention_updated', ipAddress);

    return {
      success: true,
      data: record,
      message: 'Convention updated successfully.',
    };
  }

  async addSchedule(
    conventionId: string,
    dto: CreateScheduleDto,
    user: { id: bigint },
    ipAddress: string,
  ) {
    const convention = await this.getConventionOrThrow(conventionId);
    this.validateScheduleDate(convention, dto.schedule_date);

    const record = await this.prisma.conventionSchedule.create({
      data: {
        convention_id: conventionId,
        schedule_date: new Date(dto.schedule_date),
        title: dto.title,
        event_type: dto.event_type,
        start_time: dto.start_time ?? null,
        end_time: dto.end_time ?? null,
        location: dto.location,
      },
    });

    await this.logActivity(user.id, 'convention_schedule_added', ipAddress);

    return {
      success: true,
      data: record,
      message: 'Schedule added successfully.',
    };
  }

  async updateSchedule(
    conventionId: string,
    scheduleId: string,
    dto: UpdateScheduleDto,
    user: { id: bigint },
    ipAddress: string,
  ) {
    const convention = await this.getConventionOrThrow(conventionId);

    const existing = await this.prisma.conventionSchedule.findFirst({
      where: { id: scheduleId, convention_id: conventionId },
    });
    if (!existing) {
      throw new NotFoundException(`Schedule with ID ${scheduleId} not found.`);
    }

    const scheduleDate = dto.schedule_date
      ? new Date(dto.schedule_date)
      : existing.schedule_date;
    this.validateScheduleDate(convention, scheduleDate);

    const record = await this.prisma.conventionSchedule.update({
      where: { id: scheduleId },
      data: {
        schedule_date: scheduleDate,
        title: dto.title ?? existing.title,
        event_type: dto.event_type ?? existing.event_type,
        start_time: dto.start_time !== undefined ? dto.start_time : existing.start_time,
        end_time: dto.end_time !== undefined ? dto.end_time : existing.end_time,
        location: dto.location ?? existing.location,
      },
    });

    await this.logActivity(user.id, 'convention_schedule_updated', ipAddress);

    return {
      success: true,
      data: record,
      message: 'Schedule updated successfully.',
    };
  }

  async removeSchedule(
    conventionId: string,
    scheduleId: string,
    user: { id: bigint },
    ipAddress: string,
  ) {
    await this.getConventionOrThrow(conventionId);

    const existing = await this.prisma.conventionSchedule.findFirst({
      where: { id: scheduleId, convention_id: conventionId },
    });
    if (!existing) {
      throw new NotFoundException(`Schedule with ID ${scheduleId} not found.`);
    }

    await this.prisma.conventionSchedule.delete({ where: { id: scheduleId } });

    await this.logActivity(user.id, 'convention_schedule_deleted', ipAddress);

    return {
      success: true,
      data: existing,
      message: 'Schedule deleted successfully.',
    };
  }

  async addSpeaker(
    conventionId: string,
    dto: CreateSpeakerDto,
    user: { id: bigint },
    ipAddress: string,
  ) {
    await this.getConventionOrThrow(conventionId);

    const record = await this.prisma.conventionSpeaker.create({
      data: {
        convention_id: conventionId,
        name: dto.name,
        role_position: dto.role_position,
        institution: dto.institution,
        presentation_topic: dto.presentation_topic,
      },
    });

    await this.logActivity(user.id, 'convention_speaker_added', ipAddress);

    return {
      success: true,
      data: record,
      message: 'Speaker added successfully.',
    };
  }

  async updateSpeaker(
    conventionId: string,
    speakerId: string,
    dto: UpdateSpeakerDto,
    user: { id: bigint },
    ipAddress: string,
  ) {
    await this.getConventionOrThrow(conventionId);

    const existing = await this.prisma.conventionSpeaker.findFirst({
      where: { id: speakerId, convention_id: conventionId },
    });
    if (!existing) {
      throw new NotFoundException(`Speaker with ID ${speakerId} not found.`);
    }

    const record = await this.prisma.conventionSpeaker.update({
      where: { id: speakerId },
      data: {
        name: dto.name ?? existing.name,
        role_position: dto.role_position ?? existing.role_position,
        institution: dto.institution ?? existing.institution,
        presentation_topic: dto.presentation_topic ?? existing.presentation_topic,
      },
    });

    await this.logActivity(user.id, 'convention_speaker_updated', ipAddress);

    return {
      success: true,
      data: record,
      message: 'Speaker updated successfully.',
    };
  }

  async removeSpeaker(
    conventionId: string,
    speakerId: string,
    user: { id: bigint },
    ipAddress: string,
  ) {
    await this.getConventionOrThrow(conventionId);

    const existing = await this.prisma.conventionSpeaker.findFirst({
      where: { id: speakerId, convention_id: conventionId },
    });
    if (!existing) {
      throw new NotFoundException(`Speaker with ID ${speakerId} not found.`);
    }

    await this.prisma.conventionSpeaker.delete({ where: { id: speakerId } });

    await this.logActivity(user.id, 'convention_speaker_deleted', ipAddress);

    return {
      success: true,
      data: existing,
      message: 'Speaker deleted successfully.',
    };
  }

  async addAttachment(
    conventionId: string,
    file: Express.Multer.File,
    user: { id: bigint },
    ipAddress: string,
  ) {
    await this.getConventionOrThrow(conventionId);

    if (!file) {
      throw new BadRequestException('File is required.');
    }

    const isPdf = file.mimetype.includes('pdf');
    const isImage = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.mimetype);

    if (!isPdf && !isImage) {
      throw new BadRequestException('Only image (JPG, PNG, WEBP) or PDF files are allowed.');
    }

    let fileUrl: string | null = null;
    let fileType: 'image' | 'pdf';

    if (isPdf) {
      this.validatePdfFile(file);
      fileUrl = await this.supabase.upload(file, 'governance', 'conventions');
      fileType = 'pdf';
    } else {
      this.validateImageFile(file);
      fileUrl = await this.cloudinary.upload(file, 'conventions');
      fileType = 'image';
    }

    if (!fileUrl) {
      throw new BadRequestException('File upload failed.');
    }

    const record = await this.prisma.conventionAttachment.create({
      data: {
        convention_id: conventionId,
        file_url: fileUrl,
        file_name: file.originalname,
        file_type: fileType,
      },
    });

    await this.logActivity(user.id, 'convention_attachment_added', ipAddress);

    return {
      success: true,
      data: record,
      message: 'Attachment added successfully.',
    };
  }

  async removeAttachment(
    conventionId: string,
    attachmentId: string,
    user: { id: bigint },
    ipAddress: string,
  ) {
    await this.getConventionOrThrow(conventionId);

    const existing = await this.prisma.conventionAttachment.findFirst({
      where: { id: attachmentId, convention_id: conventionId },
    });
    if (!existing) {
      throw new NotFoundException(`Attachment with ID ${attachmentId} not found.`);
    }

    await this.prisma.conventionAttachment.delete({ where: { id: attachmentId } });

    if (existing.file_type === 'image') {
      const publicId = this.getPublicIdFromUrl(existing.file_url);
      if (publicId) {
        await this.cloudinary.delete(publicId);
      }
    }

    await this.logActivity(user.id, 'convention_attachment_deleted', ipAddress);

    return {
      success: true,
      data: existing,
      message: 'Attachment deleted successfully.',
    };
  }

  async publish(id: string, user: { id: bigint }, ipAddress: string) {
    await this.getConventionOrThrow(id);

    const record = await this.prisma.convention.update({
      where: { id },
      data: {
        status: 'published',
        published_at: new Date(),
        updated_by: user.id,
      },
    });

    await this.logActivity(user.id, 'convention_published', ipAddress);

    return {
      success: true,
      data: record,
      message: 'Convention published successfully.',
    };
  }

  async unpublish(id: string, user: { id: bigint }, ipAddress: string) {
    await this.getConventionOrThrow(id);

    const record = await this.prisma.convention.update({
      where: { id },
      data: {
        status: 'draft',
        published_at: null,
        updated_by: user.id,
      },
    });

    await this.logActivity(user.id, 'convention_unpublished', ipAddress);

    return {
      success: true,
      data: record,
      message: 'Convention unpublished successfully.',
    };
  }

  async remove(id: string, user: { id: bigint }, ipAddress: string) {
    const existing = await this.prisma.convention.findUnique({
      where: { id },
      include: { attachments: true },
    });
    if (!existing) {
      throw new NotFoundException(`Convention with ID ${id} not found.`);
    }

    await this.prisma.convention.delete({ where: { id } });

    for (const attachment of existing.attachments) {
      if (attachment.file_type === 'image') {
        const publicId = this.getPublicIdFromUrl(attachment.file_url);
        if (publicId) {
          await this.cloudinary.delete(publicId);
        }
      }
    }

    await this.logActivity(user.id, 'convention_deleted', ipAddress);

    return {
      success: true,
      data: existing,
      message: 'Convention deleted successfully.',
    };
  }

  private async logActivity(userId: bigint, action: string, ipAddress: string) {
    try {
      await this.prisma.user_activities.create({
        data: {
          user_id: userId,
          action,
          ip_address: ipAddress,
        },
      });
    } catch (err) {
      console.error('Failed to log user activity:', err);
    }
  }
}
