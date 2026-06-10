import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ArticlesService } from './articles.service';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { CreateArticleDto } from './dto/create-article.dto';

@Controller('articles')
@UseGuards(TokenAuthGuard)
export class ArticlesController {
  constructor(private articlesService: ArticlesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  index(@GetUser() user: any) {
    return this.articlesService.index(user);
  }

  @Post()
  @UseInterceptors(FileInterceptor('article_file'))
  @HttpCode(HttpStatus.CREATED)
  store(
    @Body() createArticleDto: CreateArticleDto,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.articlesService.store(createArticleDto, file, user, req.ip || '127.0.0.1');
  }
}
