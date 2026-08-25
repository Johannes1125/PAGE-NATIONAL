import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { NationalOfficersService } from './national-officers.service';
import { CreateNationalOfficerDto } from './dto/create-national-officer.dto';
import { UpdateNationalOfficerDto } from './dto/update-national-officer.dto';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GetUser } from '../auth/get-user.decorator';

@Controller('national-officers')
export class NationalOfficersController {
  constructor(private readonly service: NationalOfficersService) {}

  // ── PUBLIC ENDPOINTS ──────────────────────────────────────────────────────

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // ── ADMIN PROTECTED ENDPOINTS ─────────────────────────────────────────────

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
  @Post('upload/image')
  @UseInterceptors(FileInterceptor('image'))
  @HttpCode(HttpStatus.OK)
  uploadImageAlias(
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.uploadImage(file);
  }

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateNationalOfficerDto,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.service.create(dto, user, req.ip || '127.0.0.1');
  }

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateNationalOfficerDto,
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
