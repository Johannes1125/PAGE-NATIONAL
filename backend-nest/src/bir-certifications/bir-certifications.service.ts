import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateBirCertificationDto } from './dto/create-bir-certification.dto';
import { UpdateBirCertificationDto } from './dto/update-bir-certification.dto';

@Injectable()
export class BirCertificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly supabaseService: SupabaseService,
  ) {}

  // Helper file validator
  validateFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required.');
    }

    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file format. Only JPG, JPEG, PNG, WEBP, and PDF are allowed.');
    }

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('File exceeds 5 MB.');
    }
  }

  // Upload certification or receipt file to Supabase
  async uploadFile(file: Express.Multer.File) {
    this.validateFile(file);
    const url = await this.supabaseService.upload(file, 'governance', 'bir-certifications');
    if (!url) {
      throw new BadRequestException('Upload failed');
    }
    return {
      success: true,
      imageUrl: url,
      message: 'File uploaded successfully.',
    };
  }

  async create(
    dto: CreateBirCertificationDto,
    file: Express.Multer.File | undefined,
    user: any,
    ipAddress: string,
  ) {
    let imageUrl: string | null = dto.imageUrl || null;
    let imagePublicId: string | null = null;
    let receiptUrl: string | null = dto.receiptUrl || null;

    if (file) {
      this.validateFile(file);
      const url = await this.supabaseService.upload(file, 'governance', 'bir-certifications');
      if (url) {
        imageUrl = url;
      }
    }

    const record = await this.prisma.birCertification.create({
      data: {
        registrationName: dto.registrationName || 'PHILIPPINE ASSOCIATION FOR GRADUATE EDUCATION PHILIPPINES (PAGE) INC.',
        tinNumber: dto.tinNumber || '661-807-029-00000',
        certificationNumber: dto.certificationNumber || '034RC20240000004198',
        exemptionCategory: dto.exemptionCategory || '85600 - Educational Support Services',
        dateOfIssuance: dto.dateOfIssuance ? new Date(dto.dateOfIssuance) : new Date('2024-10-22T00:00:00.000Z'),
        imageUrl,
        receiptUrl,
        imagePublicId,
        status: 'active',
      },
    });

    await this.logActivity(user.id, 'CREATE_BIR_CERTIFICATION', ipAddress);

    return {
      success: true,
      data: record,
      message: 'BIR certification created successfully',
    };
  }

  async findAll(pageStr?: string, limitStr?: string) {
    const where = { status: { not: 'archived' } };

    if (pageStr || limitStr) {
      const page = parseInt(pageStr || '1', 10);
      const limit = parseInt(limitStr || '10', 10);
      const skip = (page - 1) * limit;

      const [records, totalItems] = await Promise.all([
        this.prisma.birCertification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.birCertification.count({ where }),
      ]);

      return {
        success: true,
        data: records,
        meta: {
          page,
          limit,
          totalPages: Math.ceil(totalItems / limit) || 1,
          totalItems,
        },
        message: 'BIR certifications retrieved successfully',
      };
    }

    const records = await this.prisma.birCertification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return {
      success: true,
      data: records,
      meta: {
        page: 1,
        limit: records.length || 10,
        totalPages: 1,
        totalItems: records.length,
      },
      message: 'BIR certifications retrieved successfully',
    };
  }

  async findArchived() {
    const records = await this.prisma.birCertification.findMany({
      where: { status: 'archived' },
      orderBy: { updatedAt: 'desc' },
    });
    return {
      success: true,
      data: records,
      meta: { page: 1, limit: records.length || 10, totalPages: 1, totalItems: records.length },
      message: 'Archived BIR certifications retrieved successfully',
    };
  }

  async findOne(id: string) {
    const record = await this.prisma.birCertification.findUnique({
      where: { id },
    });
    if (!record) {
      throw new NotFoundException(`BIR certification record with id ${id} not found.`);
    }
    return {
      success: true,
      data: record,
      message: 'BIR certification retrieved successfully',
    };
  }

  async update(
    id: string,
    dto: UpdateBirCertificationDto,
    file: Express.Multer.File | undefined,
    user: any,
    ipAddress: string,
  ) {
    const existing = await this.prisma.birCertification.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`BIR certification record with id ${id} not found.`);
    }

    let imageUrl = dto.imageUrl !== undefined ? dto.imageUrl : existing.imageUrl;
    let receiptUrl = dto.receiptUrl !== undefined ? dto.receiptUrl : existing.receiptUrl;
    let imagePublicId = existing.imagePublicId;

    if (file) {
      this.validateFile(file);
      const url = await this.supabaseService.upload(file, 'governance', 'bir-certifications');
      if (url) {
        imageUrl = url;
      }
    }

    const record = await this.prisma.birCertification.update({
      where: { id },
      data: {
        registrationName: dto.registrationName ?? existing.registrationName,
        tinNumber: dto.tinNumber ?? existing.tinNumber,
        certificationNumber: dto.certificationNumber ?? existing.certificationNumber,
        exemptionCategory: dto.exemptionCategory ?? existing.exemptionCategory,
        dateOfIssuance: dto.dateOfIssuance ? new Date(dto.dateOfIssuance) : existing.dateOfIssuance,
        imageUrl,
        receiptUrl,
        imagePublicId,
      },
    });

    await this.logActivity(user.id, 'UPDATE_BIR_CERTIFICATION', ipAddress);

    return {
      success: true,
      data: record,
      message: 'BIR certification updated successfully',
    };
  }

  async archive(id: string, user: any, ipAddress: string) {
    const existing = await this.prisma.birCertification.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`BIR certification record with id ${id} not found.`);
    }
    if (existing.status === 'archived') {
      throw new ConflictException('BIR certification is already archived.');
    }

    // Do NOT delete Cloudinary asset on archive — keep for potential unarchive
    const record = await this.prisma.birCertification.update({
      where: { id },
      data: { status: 'archived' },
    });

    await this.logActivity(user.id, `archived_bir_certification: ${existing.registrationName}`, ipAddress);

    return {
      success: true,
      data: record,
      message: 'BIR certification archived successfully',
    };
  }

  async unarchive(id: string, user: any, ipAddress: string) {
    const existing = await this.prisma.birCertification.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`BIR certification record with id ${id} not found.`);
    }
    if (existing.status !== 'archived') {
      throw new ConflictException('BIR certification is not archived.');
    }

    const record = await this.prisma.birCertification.update({
      where: { id },
      data: { status: 'active' },
    });

    await this.logActivity(user.id, `unarchived_bir_certification: ${existing.registrationName}`, ipAddress);

    return {
      success: true,
      data: record,
      message: 'BIR certification unarchived successfully',
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
