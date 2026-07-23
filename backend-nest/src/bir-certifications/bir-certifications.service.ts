import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateBirCertificationDto } from './dto/create-bir-certification.dto';
import { UpdateBirCertificationDto } from './dto/update-bir-certification.dto';

@Injectable()
export class BirCertificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    dto: CreateBirCertificationDto,
    file: Express.Multer.File,
    user: any,
    ipAddress: string,
  ) {
    let imageUrl: string | null = null;
    let imagePublicId: string | null = null;

    if (file) {
      const uploadResult = await this.cloudinaryService.uploadWithPublicId(file, 'bir_certifications');
      if (!uploadResult) {
        throw new BadRequestException('Failed to upload image to Cloudinary');
      }
      imageUrl = uploadResult.imageUrl;
      imagePublicId = uploadResult.imagePublicId;
    }

    const record = await this.prisma.birCertification.create({
      data: {
        registrationName: dto.registrationName,
        tinNumber: dto.tinNumber,
        certificationNumber: dto.certificationNumber,
        exemptionCategory: dto.exemptionCategory,
        dateOfIssuance: new Date(dto.dateOfIssuance),
        imageUrl,
        imagePublicId,
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
    if (pageStr || limitStr) {
      const page = parseInt(pageStr || '1', 10);
      const limit = parseInt(limitStr || '10', 10);
      const skip = (page - 1) * limit;

      const [records, totalItems] = await Promise.all([
        this.prisma.birCertification.findMany({
          orderBy: { dateOfIssuance: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.birCertification.count(),
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
      orderBy: { dateOfIssuance: 'desc' },
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
    file: Express.Multer.File,
    user: any,
    ipAddress: string,
  ) {
    const existing = await this.prisma.birCertification.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`BIR certification record with id ${id} not found.`);
    }

    let imageUrl = existing.imageUrl;
    let imagePublicId = existing.imagePublicId;

    if (file) {
      if (existing.imagePublicId) {
        await this.cloudinaryService.delete(existing.imagePublicId);
      }
      const uploadResult = await this.cloudinaryService.uploadWithPublicId(file, 'bir_certifications');
      if (!uploadResult) {
        throw new BadRequestException('Failed to upload image to Cloudinary');
      }
      imageUrl = uploadResult.imageUrl;
      imagePublicId = uploadResult.imagePublicId;
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

  async remove(id: string, user: any, ipAddress: string) {
    const existing = await this.prisma.birCertification.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`BIR certification record with id ${id} not found.`);
    }

    if (existing.imagePublicId) {
      await this.cloudinaryService.delete(existing.imagePublicId);
    }

    await this.prisma.$transaction([
      this.prisma.birCertification.delete({
        where: { id },
      }),
      this.prisma.user_activities.create({
        data: {
          user_id: user.id,
          action: 'DELETE_BIR_CERTIFICATION',
          ip_address: ipAddress,
        },
      }),
    ]);

    return {
      success: true,
      data: null,
      message: 'BIR certification deleted successfully',
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
