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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { HistoricalRecordsService } from './historical-records.service';
import { CreateHistoricalRecordDto } from './dto/create-historical-record.dto';
import { UpdateHistoricalRecordDto } from './dto/update-historical-record.dto';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GetUser } from '../auth/get-user.decorator';

import { ReorderHistoricalRecordsDto } from './dto/reorder-historical-records.dto';

@Controller()
export class HistoricalRecordsController {
  constructor(private readonly service: HistoricalRecordsService) {}

  // ── PUBLIC ENDPOINTS ──────────────────────────────────────────────────────

  /**
   * Public — no auth required.
   * Records returned sorted ascending by yearStart.
   */
  @Get('public/historical-records')
  getPublic() {
    return this.service.findAll();
  }

  // ── ADMIN ENDPOINTS ───────────────────────────────────────────────────────

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('historical-records')
  findAll() {
    return this.service.findAll();
  }

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('historical-records/:id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('historical-records')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateHistoricalRecordDto,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.service.create(dto, user, req.ip || '127.0.0.1');
  }

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('historical-records-reorder')
  updateSortOrder(
    @Body() dto: ReorderHistoricalRecordsDto,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.service.updateSortOrder(dto, user, req.ip || '127.0.0.1');
  }

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('historical-records/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateHistoricalRecordDto,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.service.update(id, dto, user, req.ip || '127.0.0.1');
  }

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete('historical-records/:id')
  remove(
    @Param('id') id: string,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.service.remove(id, user, req.ip || '127.0.0.1');
  }
}
