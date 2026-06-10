import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateArticleDto } from './dto/create-article.dto';

@Injectable()
export class ArticlesService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async index(user: any) {
    let submissions;

    if (user.role === 'admin') {
      submissions = await this.prisma.article_submissions.findMany({
        include: {
          users_article_submissions_user_idTousers: true,
          users_article_submissions_reviewer_idTousers: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      });
    } else {
      submissions = await this.prisma.article_submissions.findMany({
        where: {
          user_id: user.id,
        },
        include: {
          users_article_submissions_reviewer_idTousers: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      });
    }

    // Format output relation keys to match Laravel's JSON structure
    const formatted = submissions.map((sub: any) => {
      const {
        users_article_submissions_user_idTousers,
        users_article_submissions_reviewer_idTousers,
        ...rest
      } = sub;
      
      return {
        ...rest,
        user: users_article_submissions_user_idTousers || null,
        reviewer: users_article_submissions_reviewer_idTousers || null,
      };
    });

    return {
      success: true,
      submissions: formatted,
    };
  }

  async store(createArticleDto: CreateArticleDto, file: Express.Multer.File, user: any, ipAddress: string) {
    if (!file) {
      throw new BadRequestException('Article file is required.');
    }

    const { title, author, abstract, keywords } = createArticleDto;

    // Parse keywords if sent as JSON string
    let parsedKeywords = keywords;
    if (typeof keywords === 'string') {
      try {
        parsedKeywords = JSON.parse(keywords);
      } catch (e) {
        parsedKeywords = [keywords];
      }
    }

    // Upload to Cloudinary in the "research/submissions" folder
    const url = await this.cloudinary.upload(file, 'research/submissions');

    if (!url) {
      throw new BadRequestException('Failed to upload document to Cloudinary storage.');
    }

    const submission = await this.prisma.article_submissions.create({
      data: {
        user_id: user.id,
        title,
        author,
        abstract,
        keywords: parsedKeywords,
        file_path: url,
        file_name: file.originalname,
        status: 'pending',
      },
    });

    // Audit trail log
    await this.prisma.user_activities.create({
      data: {
        user_id: user.id,
        action: `Submitted academic article for review: '${submission.title}'.`,
        ip_address: ipAddress,
      },
    });

    return {
      success: true,
      submission,
      message: 'Article submitted successfully and entered the pending queue.',
    };
  }
}
