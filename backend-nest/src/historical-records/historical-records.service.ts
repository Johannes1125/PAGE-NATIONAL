import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHistoricalRecordDto } from './dto/create-historical-record.dto';
import { UpdateHistoricalRecordDto } from './dto/update-historical-record.dto';

@Injectable()
export class HistoricalRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── PUBLIC ────────────────────────────────────────────────────────────────

  async findAll(pageStr?: string, limitStr?: string) {
    if (pageStr || limitStr) {
      const page = parseInt(pageStr || '1', 10);
      const limit = parseInt(limitStr || '10', 10);
      const skip = (page - 1) * limit;

      const [records, totalItems] = await Promise.all([
        this.prisma.historical_records.findMany({
          orderBy: [
            { yearStart: 'asc' },
            { sortOrder: 'asc' },
          ],
          skip,
          take: limit,
        }),
        this.prisma.historical_records.count(),
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
      orderBy: [
        { yearStart: 'asc' },
        { sortOrder: 'asc' },
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

  async remove(id: string, user: { id: bigint }, ipAddress: string) {
    const existing = await this.prisma.historical_records.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Historical record with id ${id} not found.`);
    }

    const record = await this.prisma.historical_records.delete({ where: { id } });

    await this.prisma.user_activities.create({
      data: {
        user_id: user.id,
        action: `Deleted Historical Record: ${record.title} (${record.yearStart})`,
        ip_address: ipAddress,
      },
    });

    return {
      success: true,
      data: record,
      message: 'Historical record deleted successfully.',
    };
  }

  async updateSortOrder(
    dto: { records: { id: string; sortOrder: number; yearStart?: number }[] },
    user: { id: bigint },
    ipAddress: string,
  ) {
    const updates = dto.records.map((r) =>
      this.prisma.historical_records.update({
        where: { id: r.id },
        data: {
          sortOrder: r.sortOrder,
          ...(r.yearStart !== undefined ? { yearStart: r.yearStart } : {}),
        },
      }),
    );
    await this.prisma.$transaction(updates);

    await this.prisma.user_activities.create({
      data: {
        user_id: user.id,
        action: 'Reordered historical records via drag-and-drop.',
        ip_address: ipAddress,
      },
    });

    return {
      success: true,
      message: 'Historical records sorted successfully.',
    };
  }
}
