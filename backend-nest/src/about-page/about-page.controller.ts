import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { AboutPageService } from './about-page.service';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GetUser } from '../auth/get-user.decorator';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { CreateOfficerDto } from './dto/create-officer.dto';
import { UpdateOfficerDto } from './dto/update-officer.dto';

@Controller()
export class AboutPageController {
  constructor(private aboutPageService: AboutPageService) {}

  // ── PUBLIC ENDPOINTS ──────────────────────────────────────────────────────

  @Get('public/about-page/sections')
  getPublicSections() {
    return this.aboutPageService.getSections(true);
  }

  @Get('public/about-page/sections/:key')
  getPublicSectionByKey(@Param('key') key: string) {
    return this.aboutPageService.getSectionByKey(key, true);
  }

  @Get('public/about-page/officers')
  getPublicOfficers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('chapter') chapter?: string,
  ) {
    return this.aboutPageService.getOfficers(true, page, limit, chapter);
  }

  @Get('public/about-page/documents/:key')
  getPublicDocuments(
    @Param('key') key: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.aboutPageService.getDocuments(key, page, limit);
  }

  // ── SECURE ADMIN-ONLY ENDPOINTS ───────────────────────────────────────────

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('about-page/sections')
  getSections() {
    return this.aboutPageService.getSections(false);
  }

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('about-page/sections/:key')
  getSectionByKey(@Param('key') key: string) {
    return this.aboutPageService.getSectionByKey(key, false);
  }

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Put('about-page/sections/:key')
  createOrUpdateSection(
    @Param('key') key: string,
    @Body() dto: UpdateSectionDto,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.aboutPageService.createOrUpdateSection(key, dto, user, req.ip || '127.0.0.1');
  }

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('about-page/sections/:key/publish')
  publishSection(
    @Param('key') key: string,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.aboutPageService.publishSection(key, user, req.ip || '127.0.0.1');
  }

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('about-page/sections/:key/unpublish')
  unpublishSection(
    @Param('key') key: string,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.aboutPageService.unpublishSection(key, user, req.ip || '127.0.0.1');
  }

  // ── OFFICERS ──────────────────────────────────────────────────────────────

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('about-page/officers/archived')
  getArchivedOfficers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.aboutPageService.getArchivedOfficers(page, limit);
  }

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('about-page/officers')
  getOfficers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('chapter') chapter?: string,
  ) {
    return this.aboutPageService.getOfficers(false, page, limit, chapter);
  }

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('about-page/officers')
  createOfficer(
    @Body() dto: CreateOfficerDto,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.aboutPageService.createOfficer(dto, user, req.ip || '127.0.0.1');
  }

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Put('about-page/officers/:id')
  updateOfficer(
    @Param('id') id: string,
    @Body() dto: UpdateOfficerDto,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.aboutPageService.updateOfficer(id, dto, user, req.ip || '127.0.0.1');
  }

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('about-page/officers/:id/archive')
  archiveOfficer(
    @Param('id') id: string,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.aboutPageService.archiveOfficer(id, user, req.ip || '127.0.0.1');
  }

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('about-page/officers/:id/unarchive')
  unarchiveOfficer(
    @Param('id') id: string,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.aboutPageService.unarchiveOfficer(id, user, req.ip || '127.0.0.1');
  }

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('about-page/officers/reorder')
  reorderOfficers(
    @Body('ids') ids: string[],
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.aboutPageService.reorderOfficers(ids, user, req.ip || '127.0.0.1');
  }

  // ── DOCUMENTS ─────────────────────────────────────────────────────────────

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('about-page/documents/archived')
  getArchivedDocuments(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.aboutPageService.getArchivedDocuments(page, limit);
  }

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('about-page/documents/:key')
  getDocuments(
    @Param('key') key: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.aboutPageService.getDocuments(key, page, limit);
  }

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('about-page/documents/:key')
  @UseInterceptors(FileInterceptor('file'))
  uploadDocument(
    @Param('key') key: string,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.aboutPageService.uploadDocument(key, file, user, req.ip || '127.0.0.1');
  }

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('about-page/documents/:id/archive')
  archiveDocument(
    @Param('id') id: string,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.aboutPageService.archiveDocument(id, user, req.ip || '127.0.0.1');
  }

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('about-page/documents/:id/unarchive')
  unarchiveDocument(
    @Param('id') id: string,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.aboutPageService.unarchiveDocument(id, user, req.ip || '127.0.0.1');
  }
}
