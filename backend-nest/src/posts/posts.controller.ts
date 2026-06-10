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
  UploadedFiles,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { PostsService } from './posts.service';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GetUser } from '../auth/get-user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller()
export class PostsController {
  constructor(private postsService: PostsService) {}

  // Landing Page Route (Public)
  @Get('public/posts')
  @HttpCode(HttpStatus.OK)
  indexPublic(@Query('category') category?: string) {
    return this.postsService.index('published', category);
  }

  // Secure List Route
  @UseGuards(TokenAuthGuard)
  @Get('posts')
  @HttpCode(HttpStatus.OK)
  indexSecure(@Query('status') status?: string, @Query('category') category?: string) {
    return this.postsService.index(status, category);
  }

  // Create Post with File Uploads
  @UseGuards(TokenAuthGuard)
  @Post('posts')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'featured_image', maxCount: 1 },
      { name: 'proof_of_payment', maxCount: 1 },
      { name: 'supporting_file', maxCount: 1 },
    ]),
  )
  @HttpCode(HttpStatus.CREATED)
  store(
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles()
    files: {
      featured_image?: Express.Multer.File[];
      proof_of_payment?: Express.Multer.File[];
      supporting_file?: Express.Multer.File[];
    },
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.postsService.store(createPostDto, user, files, req.ip || '127.0.0.1');
  }

  // Update Post
  @UseGuards(TokenAuthGuard)
  @Put('posts/:id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @GetUser() user: any,
    @Req() req: Request,
  ) {
    return this.postsService.update(BigInt(id), updatePostDto, user, req.ip || '127.0.0.1');
  }

  // Delete Post
  @UseGuards(TokenAuthGuard)
  @Delete('posts/:id')
  @HttpCode(HttpStatus.OK)
  destroy(@Param('id') id: string, @GetUser() user: any, @Req() req: Request) {
    return this.postsService.destroy(BigInt(id), user, req.ip || '127.0.0.1');
  }

  // Admin Approve Post
  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('posts/:id/approve')
  @HttpCode(HttpStatus.OK)
  approve(@Param('id') id: string, @GetUser() adminUser: any, @Req() req: Request) {
    return this.postsService.approve(BigInt(id), adminUser, req.ip || '127.0.0.1');
  }

  // Admin Reject Post
  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('posts/:id/reject')
  @HttpCode(HttpStatus.OK)
  reject(
    @Param('id') id: string,
    @Body('feedback') feedback: string,
    @GetUser() adminUser: any,
    @Req() req: Request,
  ) {
    return this.postsService.reject(BigInt(id), feedback, adminUser, req.ip || '127.0.0.1');
  }
}
