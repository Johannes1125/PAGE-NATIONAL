import { Injectable, NotFoundException, BadRequestException, ConflictException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { CreateOfficerDto } from './dto/create-officer.dto';
import { UpdateOfficerDto } from './dto/update-officer.dto';

@Injectable()
export class AboutPageService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async onModuleInit() {
    try {
      await this.prisma.about_page_sections.updateMany({
        where: {
          section_key: 'cbl_information',
          title: { equals: 'csa', mode: 'insensitive' },
        },
        data: {
          title: 'Constitution and By-Laws',
        },
      });
      await this.prisma.cbl_governance_documents.updateMany({
        where: {
          title: { equals: 'csa', mode: 'insensitive' },
        },
        data: {
          title: 'Constitution and By-Laws',
        },
      });
    } catch (e) {
      // Ignore if database is not seeded/migrated yet
    }
  }

  // Section Methods
  async getSections(publicOnly: boolean = false) {
    const where = publicOnly ? { status: 'published' } : {};
    const sections = await this.prisma.about_page_sections.findMany({ where });
    const formattedSections = sections.map((s) => {
      if (s.section_key === 'cbl_information' && (!s.title || s.title.trim().toLowerCase() === 'csa')) {
        return { ...s, title: 'Constitution and By-Laws' };
      }
      return s;
    });
    return { success: true, data: formattedSections, message: 'Sections retrieved successfully.' };
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
    if (section.section_key === 'cbl_information' && (!section.title || section.title.trim().toLowerCase() === 'csa')) {
      section.title = 'Constitution and By-Laws';
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
  async getOfficers(activeOnly: boolean = false, pageStr?: string, limitStr?: string, chapter?: string) {
    const where: any = {
      status: { not: 'archived' },
      ...(activeOnly ? { status: 'active' } : {}),
      ...(chapter && chapter !== 'all' ? { chapter } : {}),
    };

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

  async getArchivedOfficers(pageStr?: string, limitStr?: string) {
    const where = { status: 'archived' };

    if (pageStr || limitStr) {
      const page = parseInt(pageStr || '1', 10);
      const limit = parseInt(limitStr || '10', 10);
      const skip = (page - 1) * limit;

      const [officers, totalItems] = await Promise.all([
        this.prisma.about_page_officers.findMany({
          where,
          orderBy: { updated_at: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.about_page_officers.count({ where }),
      ]);

      return {
        success: true,
        data: officers,
        meta: { page, limit, totalPages: Math.ceil(totalItems / limit) || 1, totalItems },
        message: 'Archived officers retrieved successfully.',
      };
    }

    const officers = await this.prisma.about_page_officers.findMany({
      where,
      orderBy: { updated_at: 'desc' },
    });
    return {
      success: true,
      data: officers,
      meta: { page: 1, limit: officers.length || 10, totalPages: 1, totalItems: officers.length },
      message: 'Archived officers retrieved successfully.',
    };
  }

  async createOfficer(dto: CreateOfficerDto, user: any, ipAddress: string) {
    const count = await this.prisma.about_page_officers.count({ where: { status: { not: 'archived' } } });
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

  async archiveOfficer(id: string, user: any, ipAddress: string) {
    const existing = await this.prisma.about_page_officers.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Officer with ID ${id} not found.`);
    }
    if (existing.status === 'archived') {
      throw new ConflictException('Officer is already archived.');
    }

    const officer = await this.prisma.about_page_officers.update({
      where: { id },
      data: { status: 'archived' },
    });

    await this.prisma.user_activities.create({
      data: {
        user_id: user.id,
        action: `archived_about_page_officer: ${existing.name}`,
        ip_address: ipAddress,
      },
    });

    return { success: true, data: officer, message: 'Officer archived successfully.' };
  }

  async unarchiveOfficer(id: string, user: any, ipAddress: string) {
    const existing = await this.prisma.about_page_officers.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Officer with ID ${id} not found.`);
    }
    if (existing.status !== 'archived') {
      throw new ConflictException('Officer is not archived.');
    }

    const officer = await this.prisma.about_page_officers.update({
      where: { id },
      data: { status: 'active' },
    });

    await this.prisma.user_activities.create({
      data: {
        user_id: user.id,
        action: `unarchived_about_page_officer: ${existing.name}`,
        ip_address: ipAddress,
      },
    });

    return { success: true, data: officer, message: 'Officer unarchived successfully.' };
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
    const where: any = { section_key, status: { not: 'archived' } };
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

  async getArchivedDocuments(pageStr?: string, limitStr?: string) {
    const where = { status: 'archived' };

    if (pageStr || limitStr) {
      const page = parseInt(pageStr || '1', 10);
      const limit = parseInt(limitStr || '10', 10);
      const skip = (page - 1) * limit;

      const [docs, totalItems] = await Promise.all([
        this.prisma.about_page_documents.findMany({
          where,
          orderBy: { updated_at: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.about_page_documents.count({ where }),
      ]);

      return {
        success: true,
        data: docs,
        meta: { page, limit, totalPages: Math.ceil(totalItems / limit) || 1, totalItems },
        message: 'Archived documents retrieved successfully.',
      };
    }

    const docs = await this.prisma.about_page_documents.findMany({ where, orderBy: { updated_at: 'desc' } });
    return {
      success: true,
      data: docs,
      meta: { page: 1, limit: docs.length || 10, totalPages: 1, totalItems: docs.length },
      message: 'Archived documents retrieved successfully.',
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
        status: 'active',
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

  async archiveDocument(id: string, user: any, ipAddress: string) {
    const doc = await this.prisma.about_page_documents.findUnique({ where: { id } });
    if (!doc) {
      throw new NotFoundException(`Document with ID ${id} not found.`);
    }
    if (doc.status === 'archived') {
      throw new ConflictException('Document is already archived.');
    }

    const updated = await this.prisma.about_page_documents.update({
      where: { id },
      data: { status: 'archived' },
    });

    let actionLabel = 'Archived branding asset';
    if (doc.section_key === 'sec_registration') actionLabel = 'archived_sec_document';
    if (doc.section_key === 'bir_certification') actionLabel = 'archived_bir_document';

    await this.prisma.user_activities.create({
      data: {
        user_id: user.id,
        action: `${actionLabel}: ${doc.file_name}`,
        ip_address: ipAddress,
      },
    });

    return { success: true, data: updated, message: 'Document archived successfully.' };
  }

  async unarchiveDocument(id: string, user: any, ipAddress: string) {
    const doc = await this.prisma.about_page_documents.findUnique({ where: { id } });
    if (!doc) {
      throw new NotFoundException(`Document with ID ${id} not found.`);
    }
    if (doc.status !== 'archived') {
      throw new ConflictException('Document is not archived.');
    }

    const updated = await this.prisma.about_page_documents.update({
      where: { id },
      data: { status: 'active' },
    });

    let actionLabel = 'Unarchived branding asset';
    if (doc.section_key === 'sec_registration') actionLabel = 'unarchived_sec_document';
    if (doc.section_key === 'bir_certification') actionLabel = 'unarchived_bir_document';

    await this.prisma.user_activities.create({
      data: {
        user_id: user.id,
        action: `${actionLabel}: ${doc.file_name}`,
        ip_address: ipAddress,
      },
    });

    return { success: true, data: updated, message: 'Document unarchived successfully.' };
  }
}
