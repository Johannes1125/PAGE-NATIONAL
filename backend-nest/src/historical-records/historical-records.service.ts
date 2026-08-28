import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHistoricalRecordDto } from './dto/create-historical-record.dto';
import { UpdateHistoricalRecordDto } from './dto/update-historical-record.dto';

@Injectable()
export class HistoricalRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── PUBLIC / ADMIN LIST ────────────────────────────────────────────────────

  async findAll(pageStr?: string, limitStr?: string, programType?: string, includeArchived = false) {
    const where: any = {};
    if (programType && programType !== 'all') {
      where.programType = programType;
    }
    if (!includeArchived) {
      where.status = { not: 'archived' };
    }

    if (pageStr || limitStr) {
      const page = parseInt(pageStr || '1', 10);
      const limit = parseInt(limitStr || '10', 10);
      const skip = (page - 1) * limit;

      const [records, totalItems] = await Promise.all([
        this.prisma.historical_records.findMany({
          where,
          orderBy: [
            { yearStart: 'desc' },
            { createdAt: 'desc' },
          ],
          skip,
          take: limit,
        }),
        this.prisma.historical_records.count({ where }),
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
        message: 'Historical records retrieved successfully.',
      };
    }

    const records = await this.prisma.historical_records.findMany({
      where,
      orderBy: [
        { yearStart: 'desc' },
        { createdAt: 'desc' },
      ],
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
      message: 'Historical records retrieved successfully.',
    };
  }

  async findArchived(pageStr?: string, limitStr?: string) {
    const where = { status: 'archived' };

    if (pageStr || limitStr) {
      const page = parseInt(pageStr || '1', 10);
      const limit = parseInt(limitStr || '10', 10);
      const skip = (page - 1) * limit;

      const [records, totalItems] = await Promise.all([
        this.prisma.historical_records.findMany({
          where,
          orderBy: { updatedAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.historical_records.count({ where }),
      ]);

      return {
        success: true,
        data: records,
        meta: { page, limit, totalPages: Math.ceil(totalItems / limit) || 1, totalItems },
        message: 'Archived historical records retrieved successfully.',
      };
    }

    const records = await this.prisma.historical_records.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });
    return {
      success: true,
      data: records,
      meta: { page: 1, limit: records.length || 10, totalPages: 1, totalItems: records.length },
      message: 'Archived historical records retrieved successfully.',
    };
  }

  // ── ADMIN ─────────────────────────────────────────────────────────────────

  async findOne(id: string) {
    const record = await this.prisma.historical_records.findUnique({
      where: { id },
    });
    if (!record) {
      throw new NotFoundException(`Historical record with id ${id} not found.`);
    }
    return {
      success: true,
      data: record,
      message: 'Historical record retrieved successfully.',
    };
  }

  async create(dto: CreateHistoricalRecordDto, user: { id: bigint }, ipAddress: string) {
    const record = await this.prisma.historical_records.create({
      data: {
        title: dto.title,
        yearStart: dto.yearStart,
        programType: dto.programType,
        description: dto.description,
        status: 'active',
      },
    });

    await this.prisma.user_activities.create({
      data: {
        user_id: user.id,
        action: `Created Historical Record: ${record.title} (${record.yearStart})`,
        ip_address: ipAddress,
      },
    });

    return {
      success: true,
      data: record,
      message: 'Historical record created successfully.',
    };
  }

  async update(id: string, dto: UpdateHistoricalRecordDto, user: { id: bigint }, ipAddress: string) {
    const existing = await this.prisma.historical_records.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Historical record with id ${id} not found.`);
    }

    const record = await this.prisma.historical_records.update({
      where: { id },
      data: {
        title: dto.title ?? existing.title,
        yearStart: dto.yearStart ?? existing.yearStart,
        programType: dto.programType ?? existing.programType,
        description: dto.description ?? existing.description,
      },
    });

    await this.prisma.user_activities.create({
      data: {
        user_id: user.id,
        action: `Updated Historical Record: ${record.title} (${record.yearStart})`,
        ip_address: ipAddress,
      },
    });

    return {
      success: true,
      data: record,
      message: 'Historical record updated successfully.',
    };
  }

  async archive(id: string, user: { id: bigint }, ipAddress: string) {
    const existing = await this.prisma.historical_records.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Historical record with id ${id} not found.`);
    }
    if (existing.status === 'archived') {
      throw new ConflictException('Historical record is already archived.');
    }

    const record = await this.prisma.historical_records.update({
      where: { id },
      data: { status: 'archived' },
    });

    await this.prisma.user_activities.create({
      data: {
        user_id: user.id,
        action: `archived_historical_record: ${existing.title} (${existing.yearStart})`,
        ip_address: ipAddress,
      },
    });

    return {
      success: true,
      data: record,
      message: 'Historical record archived successfully.',
    };
  }

  async unarchive(id: string, user: { id: bigint }, ipAddress: string) {
    const existing = await this.prisma.historical_records.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Historical record with id ${id} not found.`);
    }
    if (existing.status !== 'archived') {
      throw new ConflictException('Historical record is not archived.');
    }

    const record = await this.prisma.historical_records.update({
      where: { id },
      data: { status: 'active' },
    });

    await this.prisma.user_activities.create({
      data: {
        user_id: user.id,
        action: `unarchived_historical_record: ${existing.title} (${existing.yearStart})`,
        ip_address: ipAddress,
      },
    });

    return {
      success: true,
      data: record,
      message: 'Historical record unarchived successfully.',
    };
  }
}
