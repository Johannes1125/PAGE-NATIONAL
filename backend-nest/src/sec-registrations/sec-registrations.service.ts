import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateSecRegistrationDto } from './dto/create-sec-registration.dto';
import { UpdateSecRegistrationDto } from './dto/update-sec-registration.dto';

@Injectable()
export class SecRegistrationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabase: SupabaseService,
  ) {}

  // Helper file validator
  validateFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Image file is required.');
    }

    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid image format. Only JPG, JPEG, PNG, and WEBP are allowed.');
    }

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('Image exceeds 5 MB.');
    }
  }

  // Upload registration image to Supabase
  async uploadImage(file: Express.Multer.File) {
    this.validateFile(file);
    const url = await this.supabase.upload(file, 'about-page', 'sec-registrations');
    if (!url) {
      throw new BadRequestException('Upload failed');
    }
    return {
      success: true,
      imageUrl: url,
      message: 'Image uploaded successfully.',
    };
  }

  // Create registration record
  async create(dto: CreateSecRegistrationDto, user: { id: bigint }, ipAddress: string) {
    const record = await this.prisma.secRegistration.create({
      data: {
        registrationName: dto.registrationName,
        registrationNumber: dto.registrationNumber,
        dateOfIncorporation: new Date(dto.dateOfIncorporation),
        exemptionCategory: dto.exemptionCategory,
        imageUrl: dto.imageUrl || null,
      },
    });

    await this.logActivity(user.id, 'Created SEC Registration', ipAddress);

    return {
      success: true,
      data: record,
      message: 'SEC registration created successfully',
    };
  }

  // Get all records sorted newest first
  async findAll(query?: { name?: string; number?: string; page?: string; limit?: string }) {
    const where: any = {};
    if (query?.name) {
      where.registrationName = {
        contains: query.name,
        mode: 'insensitive',
      };
    }
    if (query?.number) {
      where.registrationNumber = {
        contains: query.number,
        mode: 'insensitive',
      };
    }

    const page = parseInt(query?.page || '1', 10);
    const limit = parseInt(query?.limit || '10', 10);
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      this.prisma.secRegistration.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.secRegistration.count({ where }),
    ]);

    return {
      success: true,
      data: records,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      message: 'SEC registrations retrieved successfully.',
    };
  }

  // Get single record
  async findOne(id: string) {
    const record = await this.prisma.secRegistration.findUnique({
      where: { id },
    });
    if (!record) {
      throw new NotFoundException(`SEC registration record with id ${id} not found.`);
    }
    return {
      success: true,
      data: record,
      message: 'SEC registration record retrieved successfully.',
    };
  }

  // Update record
  async update(id: string, dto: UpdateSecRegistrationDto, user: { id: bigint }, ipAddress: string) {
    const existing = await this.prisma.secRegistration.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`SEC registration record with id ${id} not found.`);
    }

    const record = await this.prisma.secRegistration.update({
      where: { id },
      data: {
        registrationName: dto.registrationName ?? existing.registrationName,
        registrationNumber: dto.registrationNumber ?? existing.registrationNumber,
        dateOfIncorporation: dto.dateOfIncorporation ? new Date(dto.dateOfIncorporation) : existing.dateOfIncorporation,
        exemptionCategory: dto.exemptionCategory ?? existing.exemptionCategory,
        imageUrl: dto.imageUrl !== undefined ? dto.imageUrl : existing.imageUrl,
      },
    });

    await this.logActivity(user.id, 'Updated SEC Registration', ipAddress);

    return {
      success: true,
      data: record,
      message: 'SEC registration updated successfully',
    };
  }

  // Delete record
  async remove(id: string, user: { id: bigint }, ipAddress: string) {
    const existing = await this.prisma.secRegistration.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`SEC registration record with id ${id} not found.`);
    }

    await this.prisma.secRegistration.delete({
      where: { id },
    });

    await this.logActivity(user.id, 'Deleted SEC Registration', ipAddress);

    return {
      success: true,
      message: 'SEC registration deleted successfully',
    };
  }

  // Logging utility
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
