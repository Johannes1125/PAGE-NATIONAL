import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreatePageLogoDto } from './dto/create-page-logo.dto';
import { UpdatePageLogoDto } from './dto/update-page-logo.dto';

@Injectable()
export class PageLogoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  // Helper file validator
  private validateFile(file: Express.Multer.File, isRequired = true) {
    if (!file) {
      if (isRequired) {
        throw new BadRequestException('Logo image is required.');
      }
      return;
    }

    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPG, JPEG, PNG, and SVG are allowed.');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('Image size exceeds the 5MB limit.');
    }
  }

  // Helper sequence generator
  private async generateNextSequenceNumber(): Promise<string> {
    const lastRecord = await this.prisma.page_logos.findFirst({
      orderBy: { id: 'desc' },
    });

    if (!lastRecord || !lastRecord.sequenceNumber) {
      return 'PL-001';
    }

    const match = lastRecord.sequenceNumber.match(/PL-(\d+)/);
    if (!match) {
      return 'PL-001';
    }

    const nextVal = parseInt(match[1], 10) + 1;
    return `PL-${String(nextVal).padStart(3, '0')}`;
  }

  // ── PUBLIC ────────────────────────────────────────────────────────────────

  async findAll() {
    const records = await this.prisma.page_logos.findMany({
      where: { status: { not: 'archived' } },
      orderBy: { id: 'asc' },
    });
    return {
      success: true,
      data: records,
      message: 'PAGE logos retrieved successfully',
    };
  }

  async findArchived() {
    const records = await this.prisma.page_logos.findMany({
      where: { status: 'archived' },
      orderBy: { updatedAt: 'desc' },
    });
    return {
      success: true,
      data: records,
      meta: { page: 1, limit: records.length || 10, totalPages: 1, totalItems: records.length },
      message: 'Archived PAGE logos retrieved successfully',
    };
  }

  // ── ADMIN ─────────────────────────────────────────────────────────────────

  async findOne(id: number) {
    const record = await this.prisma.page_logos.findUnique({
      where: { id },
    });
    if (!record) {
      throw new NotFoundException(`PAGE logo with id ${id} not found.`);
    }
    return {
      success: true,
      data: record,
      message: 'PAGE logo retrieved successfully',
    };
  }

  async create(
    dto: CreatePageLogoDto,
    file: Express.Multer.File,
    user: { id: bigint },
    ipAddress: string,
  ) {
    this.validateFile(file, true);

    const sequenceNumber = await this.generateNextSequenceNumber();

    // Upload to Cloudinary
    const uploadResult = await this.cloudinary.uploadWithPublicId(file, 'about_page/page_logo');
    if (!uploadResult) {
      throw new BadRequestException('Image upload failed.');
    }

    const record = await this.prisma.page_logos.create({
      data: {
        sequenceNumber,
        title: dto.title,
        description: dto.description,
        imageUrl: uploadResult.imageUrl,
        imagePublicId: uploadResult.imagePublicId,
        status: 'active',
      },
    });

    // Log Activity
    await this.prisma.user_activities.create({
      data: {
        user_id: user.id,
        action: `Created PAGE Logo: ${record.title}`,
        ip_address: ipAddress,
      },
    });

    return {
      success: true,
      data: record,
      message: 'PAGE logo created successfully',
    };
  }

  async update(
    id: number,
    dto: UpdatePageLogoDto,
    file: Express.Multer.File,
    user: { id: bigint },
    ipAddress: string,
  ) {
    const existing = await this.prisma.page_logos.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`PAGE logo with id ${id} not found.`);
    }

    let imageUrl = existing.imageUrl;
    let imagePublicId = existing.imagePublicId;

    if (file) {
      this.validateFile(file, false);

      // Upload new image
      const uploadResult = await this.cloudinary.uploadWithPublicId(file, 'about_page/page_logo');
      if (!uploadResult) {
        throw new BadRequestException('Image upload failed.');
      }

      // Delete old Cloudinary asset
      if (existing.imagePublicId) {
        await this.cloudinary.delete(existing.imagePublicId);
      }

      imageUrl = uploadResult.imageUrl;
      imagePublicId = uploadResult.imagePublicId;
    }

    const record = await this.prisma.page_logos.update({
      where: { id },
      data: {
        title: dto.title ?? existing.title,
        description: dto.description ?? existing.description,
        imageUrl,
        imagePublicId,
      },
    });

    // Log Activity
    await this.prisma.user_activities.create({
      data: {
        user_id: user.id,
        action: `Updated PAGE Logo: ${record.title}`,
        ip_address: ipAddress,
      },
    });

    return {
      success: true,
      data: record,
      message: 'PAGE logo updated successfully',
    };
  }

  async archive(id: number, user: { id: bigint }, ipAddress: string) {
    const existing = await this.prisma.page_logos.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`PAGE logo with id ${id} not found.`);
    }
    if (existing.status === 'archived') {
      throw new ConflictException('PAGE logo is already archived.');
    }

    // Do NOT delete Cloudinary asset on archive — keep for potential unarchive
    const record = await this.prisma.page_logos.update({
      where: { id },
      data: { status: 'archived' },
    });

    await this.prisma.user_activities.create({
      data: {
        user_id: user.id,
        action: `archived_page_logo: ${existing.title}`,
        ip_address: ipAddress,
      },
    });

    return {
      success: true,
      data: record,
      message: 'PAGE logo archived successfully',
    };
  }

  async unarchive(id: number, user: { id: bigint }, ipAddress: string) {
    const existing = await this.prisma.page_logos.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`PAGE logo with id ${id} not found.`);
    }
    if (existing.status !== 'archived') {
      throw new ConflictException('PAGE logo is not archived.');
    }

    const record = await this.prisma.page_logos.update({
      where: { id },
      data: { status: 'active' },
    });

    await this.prisma.user_activities.create({
      data: {
        user_id: user.id,
        action: `unarchived_page_logo: ${existing.title}`,
        ip_address: ipAddress,
      },
    });

    return {
      success: true,
      data: record,
      message: 'PAGE logo unarchived successfully',
    };
  }
}
