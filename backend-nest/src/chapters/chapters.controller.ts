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
import { ChaptersService } from './chapters.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { ChapterStatusDto } from './dto/chapter-status.dto';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GetUser } from '../auth/get-user.decorator';
import type { Request } from 'express';

@Controller('chapters')
export class ChaptersController {
  constructor(private readonly service: ChaptersService) {}

  // ── PUBLIC ENDPOINTS ───────────────────────────────────────────────────────

  /** GET /chapters — dashboard list with search/filter/sort/pagination */
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('island_group') island_group?: string,
    @Query('region') region?: string,
    @Query('status') status?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findAll({ search, island_group, region, status, sort, page, limit });
  }

  /** GET /chapters/stats — total / luzon / visayas / mindanao counts */
  @Get('stats')
  getStats() {
    return this.service.getStats();
  }

  /** GET /chapters/:id — single chapter with all relations */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // ── ADMIN-ONLY ENDPOINTS ───────────────────────────────────────────────────

  /** POST /chapters/upload/image — upload chapter image to Supabase */
  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('upload/image')
  @UseInterceptors(FileInterceptor('image'))
  @HttpCode(HttpStatus.OK)
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.service.uploadImage(file);
  }

  /** POST /chapters/upload/document — upload chapter document to Supabase */
  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('upload/document')
  @UseInterceptors(FileInterceptor('document'))
  @HttpCode(HttpStatus.OK)
  uploadDocument(@UploadedFile() file: Express.Multer.File) {
    return this.service.uploadDocument(file);
  }

  /** POST /chapters — create chapter with all nested data */
  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateChapterDto,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.service.create(dto, user, req.ip || '127.0.0.1');
  }

  /** PATCH /chapters/:id/status — toggle draft/published/archived */
  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: ChapterStatusDto,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.service.updateStatus(id, dto, user, req.ip || '127.0.0.1');
  }

  /** PATCH /chapters/:id — update chapter step data */
  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateChapterDto,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.service.update(id, dto, user, req.ip || '127.0.0.1');
  }

  /** DELETE /chapters/:id */
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
