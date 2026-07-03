import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { ConventionsService } from './conventions.service';
import { CreateConventionDto } from './dto/create-convention.dto';
import { UpdateConventionDto } from './dto/update-convention.dto';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { CreateSpeakerDto } from './dto/create-speaker.dto';
import { UpdateSpeakerDto } from './dto/update-speaker.dto';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GetUser } from '../auth/get-user.decorator';

@UseGuards(TokenAuthGuard, RolesGuard)
@Roles('admin')
@Controller('conventions')
export class ConventionsController {
  constructor(private readonly service: ConventionsService) {}

  @Get()
  findAll(@Query('status') status?: string) {
    return this.service.findAll(status);
  }

  @Get(':id/full')
  findFull(@Param('id') id: string) {
    return this.service.findFull(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateConventionDto,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.service.create(dto, user, req.ip || '127.0.0.1');
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateConventionDto,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.service.update(id, dto, user, req.ip || '127.0.0.1');
  }

  @Post(':id/schedules')
  @HttpCode(HttpStatus.CREATED)
  addSchedule(
    @Param('id') id: string,
    @Body() dto: CreateScheduleDto,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.service.addSchedule(id, dto, user, req.ip || '127.0.0.1');
  }

  @Patch(':id/schedules/:scheduleId')
  updateSchedule(
    @Param('id') id: string,
    @Param('scheduleId') scheduleId: string,
    @Body() dto: UpdateScheduleDto,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.service.updateSchedule(id, scheduleId, dto, user, req.ip || '127.0.0.1');
  }

  @Delete(':id/schedules/:scheduleId')
  removeSchedule(
    @Param('id') id: string,
    @Param('scheduleId') scheduleId: string,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.service.removeSchedule(id, scheduleId, user, req.ip || '127.0.0.1');
  }

  @Post(':id/speakers')
  @HttpCode(HttpStatus.CREATED)
  addSpeaker(
    @Param('id') id: string,
    @Body() dto: CreateSpeakerDto,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.service.addSpeaker(id, dto, user, req.ip || '127.0.0.1');
  }

  @Patch(':id/speakers/:speakerId')
  updateSpeaker(
    @Param('id') id: string,
    @Param('speakerId') speakerId: string,
    @Body() dto: UpdateSpeakerDto,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.service.updateSpeaker(id, speakerId, dto, user, req.ip || '127.0.0.1');
  }

  @Delete(':id/speakers/:speakerId')
  removeSpeaker(
    @Param('id') id: string,
    @Param('speakerId') speakerId: string,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.service.removeSpeaker(id, speakerId, user, req.ip || '127.0.0.1');
  }

  @Post(':id/attachments')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  addAttachment(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.service.addAttachment(id, file, user, req.ip || '127.0.0.1');
  }

  @Delete(':id/attachments/:attachmentId')
  removeAttachment(
    @Param('id') id: string,
    @Param('attachmentId') attachmentId: string,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.service.removeAttachment(id, attachmentId, user, req.ip || '127.0.0.1');
  }

  @Patch(':id/publish')
  publish(
    @Param('id') id: string,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.service.publish(id, user, req.ip || '127.0.0.1');
  }

  @Patch(':id/unpublish')
  unpublish(
    @Param('id') id: string,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.service.unpublish(id, user, req.ip || '127.0.0.1');
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.service.remove(id, user, req.ip || '127.0.0.1');
  }
}
