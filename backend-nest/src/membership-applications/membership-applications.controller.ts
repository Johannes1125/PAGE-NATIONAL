import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MembershipApplicationsService } from './membership-applications.service';
import { CreateMembershipApplicationDto } from './dto/create-membership-application.dto';
import { UpdateStepDto } from './dto/update-step.dto';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { OptionalTokenAuthGuard } from '../auth/optional-token-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GetUser } from '../auth/get-user.decorator';
import { MembershipApplicationStatus } from '@prisma/client';
import type { Request } from 'express';

@Controller('membership-applications')
export class MembershipApplicationsController {
  constructor(private readonly service: MembershipApplicationsService) {}

  @UseGuards(OptionalTokenAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createDraft(
    @Body() dto: CreateMembershipApplicationDto,
    @GetUser() user: any,
  ) {
    return this.service.createDraft(dto, user);
  }

  @UseGuards(OptionalTokenAuthGuard)
  @Patch(':id/step/:stepName')
  @HttpCode(HttpStatus.OK)
  updateStep(
    @Param('id') id: string,
    @Param('stepName') stepName: string,
    @Body() dto: UpdateStepDto,
  ) {
    return this.service.updateStep(id, stepName, dto);
  }

  @Post(':id/documents')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  uploadDocument(
    @Param('id') id: string,
    @Body('documentType') documentType: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is required.');
    }
    if (!documentType) {
      throw new BadRequestException('documentType is required.');
    }
    return this.service.uploadDocument(id, file, documentType);
  }

  @UseGuards(OptionalTokenAuthGuard)
  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  submit(
    @Param('id') id: string,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.service.submit(id, user, req.ip || '127.0.0.1');
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.service.findAll();
  }

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: MembershipApplicationStatus,
    @Body('rejectionReason') rejectionReason: string,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    if (!status) {
      throw new BadRequestException('status is required.');
    }
    return this.service.updateStatus(id, status, rejectionReason, user, req.ip || '127.0.0.1');
  }
}
