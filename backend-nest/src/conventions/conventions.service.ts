import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateConventionDto } from './dto/create-convention.dto';
import { UpdateConventionDto } from './dto/update-convention.dto';

@Injectable()
export class ConventionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  // Helper file validator
  private validateFile(file: Express.Multer.File, isRequired = false) {
    if (!file) {
      if (isRequired) {
        throw new BadRequestException('Banner image is required.');
      }
      return;
    }

    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPG, JPEG, PNG, and WEBP are allowed.');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('Banner image size exceeds the 5MB limit.');
    }
  }

  // Helper to extract Cloudinary public ID from URL
  private getPublicIdFromUrl(url: string | null): string | null {
    if (!url || !url.includes('cloudinary.com')) return null;
    try {
      const parts = url.split('/upload/');
      if (parts.length < 2) return null;
      const pathParts = parts[1].split('/');
      if (pathParts[0].startsWith('v') && /^\d+$/.test(pathParts[0].substring(1))) {
        pathParts.shift(); // Remove version segment
      }
      const pathWithoutVersion = pathParts.join('/');
      const lastDotIndex = pathWithoutVersion.lastIndexOf('.');
      if (lastDotIndex === -1) return pathWithoutVersion;
      return pathWithoutVersion.substring(0, lastDotIndex);
    } catch {
      return null;
    }
  }

  // Get all conventions (supports filter by status)
  async findAll(status?: string) {
    const where: any = {};
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

  // Get a single convention
  async findOne(id: string) {
    const record = await this.prisma.convention.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException(`Convention with ID ${id} not found.`);
    }

    return {
      success: true,
      data: record,
      message: 'Convention retrieved successfully.',
    };
  }

  // Create a new convention
  async create(
    dto: CreateConventionDto,
    file: Express.Multer.File,
    user: { id: bigint },
    ipAddress: string,
  ) {
    this.validateFile(file, false);

    let bannerUrl: string | null = null;
    if (file) {
      const uploadResult = await this.cloudinary.upload(file, 'conventions');
      if (!uploadResult) {
        throw new BadRequestException('Banner image upload failed.');
      }
      bannerUrl = uploadResult;
    } else if (dto.banner_url) {
      bannerUrl = dto.banner_url;
    }

    const status = dto.status ?? 'draft';
    const publishedAt = status === 'published' ? new Date() : null;

    const record = await this.prisma.convention.create({
      data: {
        convention_number: dto.convention_number,
        title: dto.title,
        location: dto.location,
        convention_date: new Date(dto.convention_date),
        status,
        banner_url: bannerUrl,
        description: dto.description ?? null,
        created_by: user.id,
        updated_by: user.id,
        published_at: publishedAt,
      },
    });

    await this.logActivity(user.id, `Created Convention: ${record.title}`, ipAddress);

    return {
      success: true,
      data: record,
      message: 'Convention created successfully.',
    };
  }

  // Update a convention
  async update(
    id: string,
    dto: UpdateConventionDto,
    file: Express.Multer.File,
    user: { id: bigint },
    ipAddress: string,
  ) {
    const existing = await this.prisma.convention.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Convention with ID ${id} not found.`);
    }

    let bannerUrl = existing.banner_url;

    if (file) {
      this.validateFile(file, false);

      const uploadResult = await this.cloudinary.upload(file, 'conventions');
      if (!uploadResult) {
        throw new BadRequestException('Banner image upload failed.');
      }

      // Clean up previous image if it was hosted on Cloudinary
      if (existing.banner_url) {
        const publicId = this.getPublicIdFromUrl(existing.banner_url);
        if (publicId) {
          await this.cloudinary.delete(publicId);
        }
      }

      bannerUrl = uploadResult;
    } else if (dto.banner_url !== undefined) {
      bannerUrl = dto.banner_url;
    }

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
        location: dto.location ?? existing.location,
        convention_date: dto.convention_date ? new Date(dto.convention_date) : existing.convention_date,
        status: newStatus,
        banner_url: bannerUrl,
        description: dto.description !== undefined ? dto.description : existing.description,
        updated_by: user.id,
        published_at: publishedAt,
      },
    });

    await this.logActivity(user.id, `Updated Convention: ${record.title}`, ipAddress);

    return {
      success: true,
      data: record,
      message: 'Convention updated successfully.',
    };
  }

  // Publish a convention
  async publish(id: string, user: { id: bigint }, ipAddress: string) {
    const existing = await this.prisma.convention.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Convention with ID ${id} not found.`);
    }

    const record = await this.prisma.convention.update({
      where: { id },
      data: {
        status: 'published',
        published_at: new Date(),
        updated_by: user.id,
      },
    });

    await this.logActivity(user.id, `Published Convention: ${record.title}`, ipAddress);

    return {
      success: true,
      data: record,
      message: 'Convention published successfully.',
    };
  }

  // Unpublish a convention
  async unpublish(id: string, user: { id: bigint }, ipAddress: string) {
    const existing = await this.prisma.convention.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Convention with ID ${id} not found.`);
    }

    const record = await this.prisma.convention.update({
      where: { id },
      data: {
        status: 'draft',
        published_at: null,
        updated_by: user.id,
      },
    });

    await this.logActivity(user.id, `Unpublished Convention: ${record.title}`, ipAddress);

    return {
      success: true,
      data: record,
      message: 'Convention unpublished successfully.',
    };
  }

  // Delete a convention
  async remove(id: string, user: { id: bigint }, ipAddress: string) {
    const existing = await this.prisma.convention.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Convention with ID ${id} not found.`);
    }

    await this.prisma.convention.delete({
      where: { id },
    });

    // Clean up the banner image in Cloudinary if applicable
    if (existing.banner_url) {
      const publicId = this.getPublicIdFromUrl(existing.banner_url);
      if (publicId) {
        await this.cloudinary.delete(publicId);
      }
    }

    await this.logActivity(user.id, `Deleted Convention: ${existing.title}`, ipAddress);

    return {
      success: true,
      data: existing,
      message: 'Convention deleted successfully.',
    };
  }

  // Helper activity logger
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
