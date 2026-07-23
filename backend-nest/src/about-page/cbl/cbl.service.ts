import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateCblArticleDto } from './dto/create-cbl-article.dto';
import { UpdateCblArticleDto } from './dto/update-cbl-article.dto';
import { CreateGovernanceDocumentDto } from './dto/create-governance-document.dto';
import { UpdateGovernanceDocumentDto } from './dto/update-governance-document.dto';

@Injectable()
export class CblService {
  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
  ) {}

  // ── ARTICLES METHODS ──────────────────────────────────────────────────────

  async getArticles(pageStr?: string, limitStr?: string) {
    if (pageStr || limitStr) {
      const page = parseInt(pageStr || '1', 10);
      const limit = parseInt(limitStr || '10', 10);
      const skip = (page - 1) * limit;

      const [articles, totalItems] = await Promise.all([
        this.prisma.cbl_articles.findMany({
          orderBy: { sort_order: 'asc' },
          skip,
          take: limit,
        }),
        this.prisma.cbl_articles.count(),
      ]);

      return {
        success: true,
        data: articles,
        meta: {
          page,
          limit,
          totalPages: Math.ceil(totalItems / limit) || 1,
          totalItems,
        },
        message: 'Articles retrieved successfully.',
      };
    }

    const articles = await this.prisma.cbl_articles.findMany({
      orderBy: { sort_order: 'asc' },
    });
    return {
      success: true,
      data: articles,
      meta: {
        page: 1,
        limit: articles.length || 10,
        totalPages: 1,
        totalItems: articles.length,
      },
      message: 'Articles retrieved successfully.',
    };
  }

  async getArticleById(id: string) {
    const article = await this.prisma.cbl_articles.findUnique({
      where: { id },
    });
    if (!article) {
      throw new NotFoundException(`CBL Article with ID ${id} not found.`);
    }
    return { success: true, data: article, message: 'Article retrieved successfully.' };
  }

  async createArticle(dto: CreateCblArticleDto, user: any, ipAddress: string) {
    const count = await this.prisma.cbl_articles.count();
    
    // Check if article_number already exists to prevent duplicate entries
    const existing = await this.prisma.cbl_articles.findFirst({
      where: { article_number: dto.article_number }
    });
    if (existing) {
      throw new BadRequestException(`Article number "${dto.article_number}" already exists.`);
    }

    const article = await this.prisma.cbl_articles.create({
      data: {
        article_number: dto.article_number,
        article_name: dto.article_name,
        article_description: dto.article_description,
        sort_order: dto.sort_order ?? (count + 1),
      },
    });

    await this.logActivity(user.id, `Created CBL Article`, ipAddress);
    await this.syncToCblSection();

    return { success: true, data: article, message: 'Article created successfully.' };
  }

  async updateArticle(id: string, dto: UpdateCblArticleDto, user: any, ipAddress: string) {
    const existing = await this.prisma.cbl_articles.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`CBL Article with ID ${id} not found.`);
    }

    if (dto.article_number && dto.article_number !== existing.article_number) {
      const duplicate = await this.prisma.cbl_articles.findFirst({
        where: { article_number: dto.article_number }
      });
      if (duplicate) {
        throw new BadRequestException(`Article number "${dto.article_number}" already exists.`);
      }
    }

    const article = await this.prisma.cbl_articles.update({
      where: { id },
      data: {
        article_number: dto.article_number ?? existing.article_number,
        article_name: dto.article_name ?? existing.article_name,
        article_description: dto.article_description ?? existing.article_description,
        sort_order: dto.sort_order ?? existing.sort_order,
      },
    });

    await this.logActivity(user.id, `Updated CBL ${article.article_number}`, ipAddress);
    await this.syncToCblSection();

    return { success: true, data: article, message: 'Article updated successfully.' };
  }

  async deleteArticle(id: string, user: any, ipAddress: string) {
    const existing = await this.prisma.cbl_articles.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`CBL Article with ID ${id} not found.`);
    }

    await this.prisma.cbl_articles.delete({
      where: { id },
    });

    await this.logActivity(user.id, `Deleted CBL ${existing.article_number}`, ipAddress);
    await this.syncToCblSection();

    return { success: true, message: 'Article deleted successfully.' };
  }

  // ── GOVERNANCE DOCUMENT METHODS ───────────────────────────────────────────

  async getGovernance() {
    const document = await this.prisma.cbl_governance_documents.findFirst({
      orderBy: { created_at: 'desc' },
    });
    return { success: true, data: document, message: 'Governance document retrieved successfully.' };
  }

  async createGovernance(
    dto: CreateGovernanceDocumentDto,
    file: Express.Multer.File | undefined,
    user: any,
    ipAddress: string,
  ) {
    let fileUrl: string | undefined;
    let fileName: string | undefined;
    let fileSize: number | undefined;

    if (file) {
      if (!file.mimetype.includes('pdf')) {
        throw new BadRequestException('Only PDF files are allowed.');
      }
      const folder = 'about_page/cbl_governance';
      const url = await this.supabase.upload(file, 'governance', folder);
      if (!url) {
        throw new BadRequestException('Failed to upload file to Supabase.');
      }
      fileUrl = url;
      fileName = file.originalname;
      fileSize = file.size;
    }

    const document = await this.prisma.cbl_governance_documents.create({
      data: {
        title: dto.title,
        general_description: dto.general_description,
        file_name: fileName ?? dto.file_name ?? null,
        file_url: fileUrl ?? dto.file_url ?? null,
        file_size: fileSize ?? dto.file_size ?? null,
        uploaded_by: user.name || user.email || 'Admin',
      },
    });

    await this.logActivity(
      user.id,
      file ? 'Uploaded Governance Document' : 'Created Governance Document Info',
      ipAddress,
    );
    await this.syncToCblSection();

    return { success: true, data: document, message: 'Governance document created successfully.' };
  }

  async updateGovernance(
    id: string,
    dto: UpdateGovernanceDocumentDto,
    file: Express.Multer.File | undefined,
    user: any,
    ipAddress: string,
  ) {
    const existing = await this.prisma.cbl_governance_documents.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Governance document with ID ${id} not found.`);
    }

    let fileUrl = existing.file_url;
    let fileName = existing.file_name;
    let fileSize = existing.file_size;
    let uploadedBy = existing.uploaded_by;

    if (dto.removeFile === true || dto.removeFile === 'true') {
      fileUrl = null;
      fileName = null;
      fileSize = null;
      uploadedBy = null;
    } else if (file) {
      if (!file.mimetype.includes('pdf')) {
        throw new BadRequestException('Only PDF files are allowed.');
      }
      const folder = 'about_page/cbl_governance';
      const url = await this.supabase.upload(file, 'governance', folder);
      if (!url) {
        throw new BadRequestException('Failed to upload file to Supabase.');
      }
      fileUrl = url;
      fileName = file.originalname;
      fileSize = file.size;
      uploadedBy = user.name || user.email || 'Admin';
    }

    const document = await this.prisma.cbl_governance_documents.update({
      where: { id },
      data: {
        title: dto.title ?? existing.title,
        general_description: dto.general_description ?? existing.general_description,
        file_name: fileName,
        file_url: fileUrl,
        file_size: fileSize,
        uploaded_by: uploadedBy,
      },
    });

    await this.logActivity(
      user.id,
      file ? 'Uploaded Governance Document' : 'Updated Governance Document',
      ipAddress,
    );
    await this.syncToCblSection();

    return { success: true, data: document, message: 'Governance document updated successfully.' };
  }

  async deleteGovernance(id: string, user: any, ipAddress: string) {
    const existing = await this.prisma.cbl_governance_documents.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Governance document with ID ${id} not found.`);
    }

    await this.prisma.cbl_governance_documents.delete({
      where: { id },
    });

    await this.logActivity(user.id, 'Deleted Governance Document', ipAddress);
    await this.syncToCblSection();

    return { success: true, message: 'Governance document deleted successfully.' };
  }

  // ── HELPER METHODS ────────────────────────────────────────────────────────

  private async logActivity(userId: any, action: string, ipAddress: string) {
    try {
      await this.prisma.user_activities.create({
        data: {
          user_id: BigInt(userId),
          action,
          ip_address: ipAddress,
        },
      });
    } catch (err) {
      console.error('Failed to log user activity:', err);
    }
  }

  private async syncToCblSection() {
    const articleRecords = await this.prisma.cbl_articles.findMany({
      orderBy: { sort_order: 'asc' },
    });

    const govDoc = await this.prisma.cbl_governance_documents.findFirst({
      orderBy: { created_at: 'desc' },
    });

    const section = await this.prisma.about_page_sections.findUnique({
      where: { section_key: 'cbl_information' },
    });

    let currentContent: any = {};
    if (section && section.content) {
      try {
        currentContent = JSON.parse(section.content);
      } catch (e) {
        currentContent = {};
      }
    }

    const parseSections = (desc: string): string[] => {
      if (!desc) return [];
      // If it contains paragraphs or HTML tags, parse them
      if (desc.includes('<p>')) {
        return desc
          .split(/<\/p>/i)
          .map((p) => p.replace(/<[^>]*>/g, '').trim())
          .filter((p) => p.length > 0);
      }
      // Otherwise split by newlines
      return desc
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    };

    const updatedContent = {
      ...currentContent,
      title: govDoc?.title || currentContent.title || 'Constitution and By-Laws',
      introduction: govDoc?.general_description || currentContent.introduction || '',
      pdfUrl: govDoc?.file_url || currentContent.pdfUrl || '',
      articles: articleRecords.map((art) => ({
        id: art.id,
        articleNumber: art.article_number,
        title: art.article_name,
        sections: parseSections(art.article_description),
      })),
    };

    await this.prisma.about_page_sections.upsert({
      where: { section_key: 'cbl_information' },
      create: {
        section_key: 'cbl_information',
        title: updatedContent.title,
        content: JSON.stringify(updatedContent),
        status: 'draft',
      },
      update: {
        title: updatedContent.title,
        content: JSON.stringify(updatedContent),
      },
    });
  }
}
