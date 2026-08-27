import {
  Controller,
  Get,
  Patch,
  Delete,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BatchDeleteNotificationsDto } from './dto/batch-delete-notifications.dto';
import { QueryNotificationsDto } from './dto/query-notifications.dto';

@Controller('notifications')
@UseGuards(TokenAuthGuard, RolesGuard)
@Roles('admin')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getNotifications(@Query() query: QueryNotificationsDto) {
    const data = await this.notificationsService.getNotifications(query.limit);
    return {
      success: true,
      data,
      message: 'Notifications retrieved successfully',
    };
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(@Param('id') id: string) {
    const data = await this.notificationsService.markAsRead(id);
    return {
      success: true,
      data,
      message: 'Notification marked as read',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteNotification(@Param('id') id: string) {
    const data = await this.notificationsService.deleteNotification(id);
    return {
      success: true,
      data,
      message: 'Notification deleted successfully',
    };
  }

  @Post('batch-delete')
  @HttpCode(HttpStatus.OK)
  async batchDelete(@Body() body: BatchDeleteNotificationsDto) {
    const data = await this.notificationsService.batchDelete(body.ids);
    return {
      success: true,
      data,
      message: 'Notifications deleted successfully',
    };
  }
}
