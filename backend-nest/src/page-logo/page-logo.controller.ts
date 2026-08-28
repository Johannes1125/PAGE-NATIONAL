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
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PageLogoService } from './page-logo.service';
import { CreatePageLogoDto } from './dto/create-page-logo.dto';
import { UpdatePageLogoDto } from './dto/update-page-logo.dto';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GetUser } from '../auth/get-user.decorator';
import type { Request } from 'express';

@Controller()
export class PageLogoController {
  constructor(private readonly service: PageLogoService) {}

  // ── PUBLIC ENDPOINTS ──────────────────────────────────────────────────────

  @Get('public/page-logo')
  findPublicAll() {
    return this.service.findAll();
  }

  // ── ADMIN-ONLY ENDPOINTS ──────────────────────────────────────────────────

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('page-logo/archived')
  findArchived() {
    return this.service.findArchived();
  }

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('page-logo')
  @UseInterceptors(FileInterceptor('image'))
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreatePageLogoDto,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.service.create(dto, file, user, req.ip || '127.0.0.1');
  }

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('page-logo')
  findAll() {
    return this.service.findAll();
  }

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('page-logo/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('page-logo/:id')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePageLogoDto,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.service.update(id, dto, file, user, req.ip || '127.0.0.1');
  }

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('page-logo/:id/archive')
  archive(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.service.archive(id, user, req.ip || '127.0.0.1');
  }

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('page-logo/:id/unarchive')
  unarchive(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.service.unarchive(id, user, req.ip || '127.0.0.1');
  }
}
