import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { TokenAuthGuard } from '../../auth/token-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { GetUser } from '../../auth/get-user.decorator';
import { CblService } from './cbl.service';
import { CreateCblArticleDto } from './dto/create-cbl-article.dto';
import { UpdateCblArticleDto } from './dto/update-cbl-article.dto';
import { CreateGovernanceDocumentDto } from './dto/create-governance-document.dto';
import { UpdateGovernanceDocumentDto } from './dto/update-governance-document.dto';

@Controller('about-page/cbl')
@UseGuards(TokenAuthGuard, RolesGuard)
@Roles('admin')
export class CblController {
  constructor(private readonly cblService: CblService) {}

  // ── ARTICLES ENDPOINTS ───────────────────────────────────────────────────

  @Get('articles/archived')
  getArchivedArticles(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.cblService.getArchivedArticles(page, limit);
  }

  @Get('articles')
  getArticles(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('includeArchived') includeArchived?: string,
  ) {
    return this.cblService.getArticles(page, limit, includeArchived === 'true');
  }

  @Get('articles/:id')
  getArticleById(@Param('id') id: string) {
    return this.cblService.getArticleById(id);
  }

  @Post('articles')
  createArticle(
    @Body() dto: CreateCblArticleDto,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.cblService.createArticle(dto, user, req.ip || '127.0.0.1');
  }

  @Patch('articles/:id')
  updateArticle(
    @Param('id') id: string,
    @Body() dto: UpdateCblArticleDto,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.cblService.updateArticle(id, dto, user, req.ip || '127.0.0.1');
  }

  @Patch('articles/:id/archive')
  archiveArticle(
    @Param('id') id: string,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.cblService.archiveArticle(id, user, req.ip || '127.0.0.1');
  }

  @Patch('articles/:id/unarchive')
  unarchiveArticle(
    @Param('id') id: string,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.cblService.unarchiveArticle(id, user, req.ip || '127.0.0.1');
  }

  // ── GOVERNANCE DOCUMENT ENDPOINTS ────────────────────────────────────────

  @Get('governance/archived')
  getArchivedGovernance() {
    return this.cblService.getArchivedGovernance();
  }

  @Get('governance')
  getGovernance() {
    return this.cblService.getGovernance();
  }

  @Post('governance')
  @UseInterceptors(FileInterceptor('file'))
  createGovernance(
    @Body() dto: CreateGovernanceDocumentDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.cblService.createGovernance(dto, file, user, req.ip || '127.0.0.1');
  }

  @Patch('governance/:id')
  @UseInterceptors(FileInterceptor('file'))
  updateGovernance(
    @Param('id') id: string,
    @Body() dto: UpdateGovernanceDocumentDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.cblService.updateGovernance(id, dto, file, user, req.ip || '127.0.0.1');
  }

  @Patch('governance/:id/archive')
  archiveGovernance(
    @Param('id') id: string,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.cblService.archiveGovernance(id, user, req.ip || '127.0.0.1');
  }

  @Patch('governance/:id/unarchive')
  unarchiveGovernance(
    @Param('id') id: string,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.cblService.unarchiveGovernance(id, user, req.ip || '127.0.0.1');
  }
}
