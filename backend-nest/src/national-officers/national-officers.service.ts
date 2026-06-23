import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNationalOfficerDto } from './dto/create-national-officer.dto';
import { UpdateNationalOfficerDto } from './dto/update-national-officer.dto';

const ROLE_HIERARCHY: Record<string, number> = {
  'President': 1,
  'Vice President': 2,
  'Secretary': 3,
  'Treasurer': 4,
  'Auditor': 5,
  'Other': 6,
};

function getSortOrder(role: string): number {
  return ROLE_HIERARCHY[role] || 6;
}

@Injectable()
export class NationalOfficersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const records = await this.prisma.nationalOfficer.findMany({
      orderBy: [
        { positionCategory: 'desc' }, // "National Officers" before "Board of Directors"
        { sortOrder: 'asc' },
      ],
    });
    return {
      success: true,
      data: records,
      message: 'National officers retrieved successfully.',
    };
  }

  async findOne(id: string) {
    const record = await this.prisma.nationalOfficer.findUnique({
      where: { id },
    });
    if (!record) {
      throw new NotFoundException(`National officer with id ${id} not found.`);
    }
    return {
      success: true,
      data: record,
      message: 'National officer retrieved successfully.',
    };
  }

  async create(dto: CreateNationalOfficerDto, user: { id: bigint }, ipAddress: string) {
    const sortOrder = getSortOrder(dto.role);
    const record = await this.prisma.nationalOfficer.create({
      data: {
        memberName: dto.memberName,
        positionCategory: dto.positionCategory,
        role: dto.role,
        description: dto.description || null,
        sortOrder,
      },
    });

    await this.prisma.user_activities.create({
      data: {
        user_id: user.id,
        action: `Created National Officer: ${record.memberName} (${record.role})`,
        ip_address: ipAddress,
        created_at: new Date(),
      },
    });

    return {
      success: true,
      data: record,
      message: 'Officer created successfully.',
    };
  }

  async update(id: string, dto: UpdateNationalOfficerDto, user: { id: bigint }, ipAddress: string) {
    const existing = await this.prisma.nationalOfficer.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`National officer with id ${id} not found.`);
    }

    const newRole = dto.role ?? existing.role;
    const sortOrder = getSortOrder(newRole);

    const record = await this.prisma.nationalOfficer.update({
      where: { id },
      data: {
        memberName: dto.memberName ?? existing.memberName,
        positionCategory: dto.positionCategory ?? existing.positionCategory,
        role: dto.role ?? existing.role,
        description: dto.description !== undefined ? dto.description : existing.description,
        sortOrder,
      },
    });

    await this.prisma.user_activities.create({
      data: {
        user_id: user.id,
        action: `Updated National Officer: ${record.memberName} (${record.role})`,
        ip_address: ipAddress,
        created_at: new Date(),
      },
    });

    return {
      success: true,
      data: record,
      message: 'Officer updated successfully.',
    };
  }

  async remove(id: string, user: { id: bigint }, ipAddress: string) {
    const existing = await this.prisma.nationalOfficer.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`National officer with id ${id} not found.`);
    }

    const record = await this.prisma.nationalOfficer.delete({
      where: { id },
    });

    await this.prisma.user_activities.create({
      data: {
        user_id: user.id,
        action: `Deleted National Officer: ${record.memberName} (${record.role})`,
        ip_address: ipAddress,
        created_at: new Date(),
      },
    });

    return {
      success: true,
      data: record,
      message: 'Officer deleted successfully.',
    };
  }
}
