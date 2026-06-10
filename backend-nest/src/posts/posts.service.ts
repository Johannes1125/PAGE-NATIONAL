import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async index(status?: string, category?: string) {
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (category) {
      where.category = category;
    }

    const posts = await this.prisma.posts.findMany({
      where,
      include: {
        post_attachments: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Rename post_attachments key to attachments to match Laravel output
    const formattedPosts = posts.map((post) => {
      const { post_attachments, ...rest } = post;
      return {
        ...rest,
        attachments: post_attachments,
      };
    });

    return {
      success: true,
      posts: formattedPosts,
    };
  }

  async store(
    createPostDto: CreatePostDto,
    user: any,
    files: {
      featured_image?: Express.Multer.File[];
      proof_of_payment?: Express.Multer.File[];
      supporting_file?: Express.Multer.File[];
    },
    ipAddress: string,
  ) {
    const { title, category, content_html, excerpt, assigned_members, scheduled_at } = createPostDto;

    let status = createPostDto.status;
    // Security check: Organizations cannot post as published immediately.
    if (user.role === 'organization' && status === 'published') {
      status = 'pending';
    }

    const post = await this.prisma.posts.create({
      data: {
        user_id: user.id,
        title,
        category,
        author: user.name,
        excerpt: excerpt || null,
        content_html,
        status,
        assigned_members: assigned_members || null,
        scheduled_at: scheduled_at ? new Date(scheduled_at) : null,
        published_at: status === 'published' ? new Date() : null,
      },
    });

    // Handle attachments
    const attachmentsToCreate: any[] = [];

    if (files?.featured_image?.[0]) {
      const url = await this.cloudinary.upload(files.featured_image[0], 'posts/featured');
      if (url) {
        attachmentsToCreate.push({
          post_id: post.id,
          file_path: url,
          file_type: 'featured_image',
          file_name: files.featured_image[0].originalname,
        });
      }
    }

    if (files?.proof_of_payment?.[0]) {
      const url = await this.cloudinary.upload(files.proof_of_payment[0], 'posts/payments');
      if (url) {
        attachmentsToCreate.push({
          post_id: post.id,
          file_path: url,
          file_type: 'proof_of_payment',
          file_name: files.proof_of_payment[0].originalname,
        });
      }
    }

    if (files?.supporting_file?.[0]) {
      const url = await this.cloudinary.upload(files.supporting_file[0], 'posts/supporting');
      if (url) {
        attachmentsToCreate.push({
          post_id: post.id,
          file_path: url,
          file_type: 'supporting',
          file_name: files.supporting_file[0].originalname,
        });
      }
    }

    if (attachmentsToCreate.length > 0) {
      await this.prisma.post_attachments.createMany({
        data: attachmentsToCreate,
      });
    }

    // Log action in audit trail
    await this.prisma.user_activities.create({
      data: {
        user_id: user.id,
        action: `Created a new post: '${post.title}' with status '${post.status}'.`,
        ip_address: ipAddress,
      },
    });

    const createdPost = await this.prisma.posts.findUnique({
      where: { id: post.id },
      include: { post_attachments: true },
    });

    const { post_attachments, ...rest } = createdPost!;
    return {
      success: true,
      post: {
        ...rest,
        attachments: post_attachments,
      },
      message: 'Post created successfully.',
    };
  }

  async approve(id: bigint, adminUser: any, ipAddress: string) {
    const post = await this.prisma.posts.findUnique({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('Post not found.');
    }

    if (post.status !== 'pending') {
      throw new BadRequestException('Post is not in pending status.');
    }

    const updatedPost = await this.prisma.posts.update({
      where: { id },
      data: {
        status: 'published',
        published_at: new Date(),
      },
    });

    await this.prisma.user_activities.create({
      data: {
        user_id: adminUser.id,
        action: `Approved post #${post.id}: '${post.title}'.`,
        ip_address: ipAddress,
      },
    });

    return {
      success: true,
      post: updatedPost,
      message: 'Post approved and published successfully.',
    };
  }

  async reject(id: bigint, feedback: string, adminUser: any, ipAddress: string) {
    if (!feedback || feedback.length < 5) {
      throw new BadRequestException('Rejection feedback is required and must be at least 5 characters.');
    }

    const post = await this.prisma.posts.findUnique({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('Post not found.');
    }

    if (post.status !== 'pending') {
      throw new BadRequestException('Post is not in pending status.');
    }

    const updatedPost = await this.prisma.posts.update({
      where: { id },
      data: {
        status: 'rejected',
        feedback,
      },
    });

    await this.prisma.user_activities.create({
      data: {
        user_id: adminUser.id,
        action: `Rejected post #${post.id}: '${post.title}'. Feedback provided.`,
        ip_address: ipAddress,
      },
    });

    return {
      success: true,
      post: updatedPost,
      message: 'Post rejected successfully.',
    };
  }

  async update(id: bigint, updatePostDto: UpdatePostDto, user: any, ipAddress: string) {
    const post = await this.prisma.posts.findUnique({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('Post not found.');
    }

    if (user.role !== 'admin' && post.user_id !== user.id) {
      throw new ForbiddenException('Unauthorized action.');
    }

    const { title, category, content_html, excerpt, assigned_members } = updatePostDto;

    let status = updatePostDto.status;
    if (user.role === 'organization' && status === 'published') {
      status = 'pending';
    }

    const updatedPost = await this.prisma.posts.update({
      where: { id },
      data: {
        title,
        category,
        content_html,
        excerpt: excerpt || null,
        assigned_members: assigned_members || null,
        status,
        published_at: status === 'published' && !post.published_at ? new Date() : post.published_at,
      },
      include: {
        post_attachments: true,
      },
    });

    await this.prisma.user_activities.create({
      data: {
        user_id: user.id,
        action: `Updated post: '${post.title}' (ID: ${post.id}).`,
        ip_address: ipAddress,
      },
    });

    const { post_attachments, ...rest } = updatedPost;
    return {
      success: true,
      post: {
        ...rest,
        attachments: post_attachments,
      },
      message: 'Post updated successfully.',
    };
  }

  async destroy(id: bigint, user: any, ipAddress: string) {
    const post = await this.prisma.posts.findUnique({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('Post not found.');
    }

    if (user.role !== 'admin' && post.user_id !== user.id) {
      throw new ForbiddenException('Unauthorized action.');
    }

    const title = post.title;
    await this.prisma.posts.delete({
      where: { id },
    });

    await this.prisma.user_activities.create({
      data: {
        user_id: user.id,
        action: `Deleted post: '${title}' (ID: ${id}).`,
        ip_address: ipAddress,
      },
    });

    return {
      success: true,
      message: 'Post deleted successfully.',
    };
  }
}
