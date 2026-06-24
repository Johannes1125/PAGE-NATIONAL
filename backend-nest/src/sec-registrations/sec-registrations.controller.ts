import {
  Controller,
  Get,
  Post,
  Put,
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
import { SecRegistrationsService } from './sec-registrations.service';
import { CreateSecRegistrationDto } from './dto/create-sec-registration.dto';
import { UpdateSecRegistrationDto } from './dto/update-sec-registration.dto';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GetUser } from '../auth/get-user.decorator';
import type { Request } from 'express';

@Controller('sec-registrations')
export class SecRegistrationsController {
  constructor(private readonly service: SecRegistrationsService) {}

  // ── PUBLIC ENDPOINTS ──────────────────────────────────────────────────────

  @Get()
  findAll(
    @Query('name') name?: string,
    @Query('number') number?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findAll({ name, number, page, limit });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // ── ADMIN-ONLY ENDPOINTS ──────────────────────────────────────────────────

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateSecRegistrationDto,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.service.create(dto, user, req.ip || '127.0.0.1');
  }

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  @HttpCode(HttpStatus.OK)
  uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.uploadImage(file);
  }

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSecRegistrationDto,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.service.update(id, dto, user, req.ip || '127.0.0.1');
  }

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.service.remove(id, user, req.ip || '127.0.0.1');
  }
}
