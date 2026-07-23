import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { CreateOfficerDto } from './dto/create-officer.dto';
import { UpdateOfficerDto } from './dto/update-officer.dto';

@Injectable()
export class AboutPageService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  // Section Methods
  async getSections(publicOnly: boolean = false) {
    const where = publicOnly ? { status: 'published' } : {};
    const sections = await this.prisma.about_page_sections.findMany({ where });
    return { success: true, data: sections, message: 'Sections retrieved successfully.' };
  }

  async getSectionByKey(section_key: string, publicOnly: boolean = false) {
    const where: any = { section_key };
    if (publicOnly) {
      where.status = 'published';
    }
    const section = await this.prisma.about_page_sections.findFirst({ where });
    if (!section) {
      throw new NotFoundException(`Section with key ${section_key} not found.`);
    }
    return { success: true, data: section, message: 'Section retrieved successfully.' };
  }

  async createOrUpdateSection(section_key: string, dto: UpdateSectionDto, user: any, ipAddress: string) {
    const existing = await this.prisma.about_page_sections.findUnique({ where: { section_key } });
    let section;
    const actionText = existing ? `Updated ${existing.title}` : `Created Section ${section_key}`;

    if (existing) {
      section = await this.prisma.about_page_sections.update({
        where: { section_key },
        data: {
          title: dto.title ?? existing.title,
          content: dto.content ?? existing.content,
          status: dto.status ?? existing.status,
          published_at: dto.status === 'published' && existing.status !== 'published' ? new Date() : existing.published_at,
        },
      });
    } else {
      if (!dto.title || !dto.content) {
        throw new BadRequestException('Title and content are required to create a new section.');
      }
      section = await this.prisma.about_page_sections.create({
        data: {
          section_key,
          title: dto.title,
          content: dto.content,
          status: dto.status ?? 'draft',
          published_at: dto.status === 'published' ? new Date() : null,
        },
      });
    }

    // Log Activity
    await this.prisma.user_activities.create({
      data: {
        user_id: user.id,
        action: actionText,
        ip_address: ipAddress,
      },
    });

    return { success: true, data: section, message: 'Section saved successfully.' };
  }

  async publishSection(section_key: string, user: any, ipAddress: string) {
    const existing = await this.prisma.about_page_sections.findUnique({ where: { section_key } });
    if (!existing) throw new NotFoundException('Section not found.');

    const section = await this.prisma.about_page_sections.update({
      where: { section_key },
      data: { status: 'published', published_at: new Date() },
    });

    await this.prisma.user_activities.create({
      data: {
        user_id: user.id,
        action: `Published ${existing.title}`,
        ip_address: ipAddress,
      },
    });

    return { success: true, data: section, message: 'Section published successfully.' };
  }

  async unpublishSection(section_key: string, user: any, ipAddress: string) {
    const existing = await this.prisma.about_page_sections.findUnique({ where: { section_key } });
    if (!existing) throw new NotFoundException('Section not found.');

    const section = await this.prisma.about_page_sections.update({
      where: { section_key },
      data: { status: 'draft' },
    });

    await this.prisma.user_activities.create({
      data: {
        user_id: user.id,
        action: `Unpublished ${existing.title}`,
        ip_address: ipAddress,
      },
    });

    return { success: true, data: section, message: 'Section unpublished successfully.' };
  }

  // Officer Methods
  async getOfficers(activeOnly: boolean = false, pageStr?: string, limitStr?: string) {
    const where = activeOnly ? { status: 'active' } : {};
    if (pageStr || limitStr) {
      const page = parseInt(pageStr || '1', 10);
      const limit = parseInt(limitStr || '10', 10);
      const skip = (page - 1) * limit;

      const [officers, totalItems] = await Promise.all([
        this.prisma.about_page_officers.findMany({
          where,
          orderBy: { sort_order: 'asc' },
          skip,
          take: limit,
        }),
        this.prisma.about_page_officers.count({ where }),
      ]);

      return {
        success: true,
        data: officers,
        meta: {
          page,
          limit,
          totalPages: Math.ceil(totalItems / limit) || 1,
          totalItems,
        },
        message: 'Officers retrieved successfully.',
      };
    }

    const officers = await this.prisma.about_page_officers.findMany({
      where,
      orderBy: { sort_order: 'asc' },
    });
    return {
      success: true,
      data: officers,
      meta: {
        page: 1,
        limit: officers.length || 10,
        totalPages: 1,
        totalItems: officers.length,
      },
      message: 'Officers retrieved successfully.',
    };
  }

  async createOfficer(dto: CreateOfficerDto, user: any, ipAddress: string) {
    const count = await this.prisma.about_page_officers.count();
    const officer = await this.prisma.about_page_officers.create({
      data: {
        name: dto.name,
        position: dto.position,
        chapter: dto.chapter || null,
        photo_url: dto.photo_url || null,
        term_start: dto.term_start || null,
        term_end: dto.term_end || null,
        status: dto.status ?? 'active',
        sort_order: dto.sort_order ?? (count + 1),
      },
    });

    await this.prisma.user_activities.create({
      data: {
        user_id: user.id,
        action: `Added National Officer: ${officer.name}`,
        ip_address: ipAddress,
      },
    });

    return { success: true, data: officer, message: 'Officer created successfully.' };
  }

  async updateOfficer(id: string, dto: UpdateOfficerDto, user: any, ipAddress: string) {
    const officer = await this.prisma.about_page_officers.update({
      where: { id },
      data: {
        name: dto.name,
        position: dto.position,
        chapter: dto.chapter,
        photo_url: dto.photo_url,
        term_start: dto.term_start,
        term_end: dto.term_end,
        status: dto.status,
        sort_order: dto.sort_order,
      },
    });

    await this.prisma.user_activities.create({
      data: {
        user_id: user.id,
        action: `Updated National Officer: ${officer.name}`,
        ip_address: ipAddress,
      },
    });

    return { success: true, data: officer, message: 'Officer updated successfully.' };
  }

  async deleteOfficer(id: string, user: any, ipAddress: string) {
    const officer = await this.prisma.about_page_officers.delete({ where: { id } });

    await this.prisma.user_activities.create({
      data: {
        user_id: user.id,
        action: `Deleted National Officer: ${officer.name}`,
        ip_address: ipAddress,
      },
    });

    return { success: true, data: officer, message: 'Officer deleted successfully.' };
  }

  async reorderOfficers(ids: string[], user: any, ipAddress: string) {
    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.about_page_officers.update({
          where: { id },
          data: { sort_order: index + 1 },
        }),
      ),
    );

    await this.prisma.user_activities.create({
      data: {
        user_id: user.id,
        action: 'Reordered National Officers list',
        ip_address: ipAddress,
      },
    });

    return { success: true, message: 'Officers reordered successfully.' };
  }

  // Document / Upload Methods
  async getDocuments(section_key: string, pageStr?: string, limitStr?: string) {
    const where = { section_key };
    if (pageStr || limitStr) {
      const page = parseInt(pageStr || '1', 10);
      const limit = parseInt(limitStr || '10', 10);
      const skip = (page - 1) * limit;

      const [docs, totalItems] = await Promise.all([
        this.prisma.about_page_documents.findMany({
          where,
          orderBy: { created_at: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.about_page_documents.count({ where }),
      ]);

      return {
        success: true,
        data: docs,
        meta: {
          page,
          limit,
          totalPages: Math.ceil(totalItems / limit) || 1,
          totalItems,
        },
        message: 'Documents retrieved successfully.',
      };
    }

    const docs = await this.prisma.about_page_documents.findMany({ where, orderBy: { created_at: 'desc' } });
    return {
      success: true,
      data: docs,
      meta: {
        page: 1,
        limit: docs.length || 10,
        totalPages: 1,
        totalItems: docs.length,
      },
      message: 'Documents retrieved successfully.',
    };
  }

  async uploadDocument(section_key: string, file: Express.Multer.File, user: any, ipAddress: string) {
    const folder = `about_page/${section_key}`;
    const url = await this.cloudinary.upload(file, folder);

    if (!url) {
      throw new BadRequestException('Cloudinary upload failed.');
    }

    const doc = await this.prisma.about_page_documents.create({
      data: {
        section_key,
        file_name: file.originalname,
        file_url: url,
        file_type: file.mimetype.split('/')[1] || 'pdf',
      },
    });

    let actionLabel = 'Uploaded branding asset';
    if (section_key === 'sec_registration') actionLabel = 'Uploaded SEC Registration';
    if (section_key === 'bir_certification') actionLabel = 'Uploaded BIR Certification';

    await this.prisma.user_activities.create({
      data: {
        user_id: user.id,
        action: `${actionLabel}: ${doc.file_name}`,
        ip_address: ipAddress,
      },
    });

    // Update section timestamp
    await this.prisma.about_page_sections.updateMany({
      where: { section_key },
      data: { updated_at: new Date() },
    });

    return { success: true, data: doc, message: 'Document uploaded successfully.' };
  }

  async deleteDocument(id: string, user: any, ipAddress: string) {
    const doc = await this.prisma.about_page_documents.delete({ where: { id } });

    let actionLabel = 'Deleted branding asset';
    if (doc.section_key === 'sec_registration') actionLabel = 'Deleted SEC Registration';
    if (doc.section_key === 'bir_certification') actionLabel = 'Deleted BIR Certification';

    await this.prisma.user_activities.create({
      data: {
        user_id: user.id,
        action: `${actionLabel}: ${doc.file_name}`,
        ip_address: ipAddress,
      },
    });

    return { success: true, data: doc, message: 'Document deleted successfully.' };
  }
}
