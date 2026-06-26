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
import { BirCertificationsService } from './bir-certifications.service';
import { CreateBirCertificationDto } from './dto/create-bir-certification.dto';
import { UpdateBirCertificationDto } from './dto/update-bir-certification.dto';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GetUser } from '../auth/get-user.decorator';
import type { Request } from 'express';

@Controller('bir-certifications')
export class BirCertificationsController {
  constructor(private readonly service: BirCertificationsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateBirCertificationDto,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.service.create(dto, file, user, req.ip || '127.0.0.1');
  }

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBirCertificationDto,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.service.update(id, dto, file, user, req.ip || '127.0.0.1');
  }

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('id') id: string,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.service.remove(id, user, req.ip || '127.0.0.1');
  }
}
