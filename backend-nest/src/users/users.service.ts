import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private diffForHumans(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  }

  private toDateTimeString(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    const y = date.getFullYear();
    const m = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    const hh = pad(date.getHours());
    const mm = pad(date.getMinutes());
    const ss = pad(date.getSeconds());
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
  }

  async index() {
    const users = await this.prisma.users.findMany({
      orderBy: {
        created_at: 'desc',
      },
    });

    return {
      success: true,
      users,
    };
  }

  async update(id: bigint, updateUserDto: UpdateUserDto, adminUser: any, ipAddress: string) {
    const user = await this.prisma.users.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const { role, status, university, position } = updateUserDto;
    const changes: string[] = [];
    const updateData: any = {};

    if (role !== undefined && role !== user.role) {
      changes.push(`role from '${user.role}' to '${role}'`);
      updateData.role = role;
    }

    if (status !== undefined && status !== user.status) {
      changes.push(`status from '${user.status}' to '${status}'`);
      updateData.status = status;

      // Force logout if status is set to inactive
      if (status === 'inactive') {
        updateData.api_token_hashed = null;
      }
    }

    if (university !== undefined) {
      updateData.university = university;
    }

    if (position !== undefined) {
      updateData.position = position;
    }

    const updatedUser = await this.prisma.users.update({
      where: { id },
      data: updateData,
    });

    if (changes.length > 0) {
      const logString = changes.join(', ');
      await this.prisma.user_activities.create({
        data: {
          user_id: adminUser.id,
          action: `Modified user #${user.id} (${user.name}) attributes: ${logString}.`,
          ip_address: ipAddress,
        },
      });
    }

    return {
      success: true,
      user: updatedUser,
      message: 'User account updated successfully.',
    };
  }

  async deactivate(id: bigint, adminUser: any, ipAddress: string) {
    const user = await this.prisma.users.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    await this.prisma.users.update({
      where: { id },
      data: {
        status: 'inactive',
        api_token_hashed: null, // Clear active session token
      },
    });

    await this.prisma.user_activities.create({
      data: {
        user_id: adminUser.id,
        action: `Deactivated user account #${user.id} (${user.name}).`,
        ip_address: ipAddress,
      },
    });

    return {
      success: true,
      message: `User ${user.name} has been deactivated successfully.`,
    };
  }

  async activities(id: bigint) {
    const user = await this.prisma.users.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const activitiesRaw = await this.prisma.user_activities.findMany({
      where: { user_id: id },
      orderBy: { created_at: 'desc' },
    });

    const activities = activitiesRaw.map((act) => ({
      id: act.id,
      action: act.action,
      ipAddress: act.ip_address,
      timestamp: act.created_at ? this.toDateTimeString(act.created_at) : '',
      timeDiff: act.created_at ? this.diffForHumans(act.created_at) : 'some time ago',
    }));

    return {
      success: true,
      userName: user.name,
      activities,
    };
  }
}
