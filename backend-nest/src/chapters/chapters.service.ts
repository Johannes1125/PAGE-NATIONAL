import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { ChapterStatusDto } from './dto/chapter-status.dto';

// ── Region validation map — mirrors ChapterToolbar.tsx REGIONS_MAP ────────────
export const REGIONS_MAP: Record<string, string[]> = {
  Luzon: [
    'NCR',
    'CAR',
    'Ilocos Region',
    'Cagayan Valley',
    'Central Luzon',
    'CALABARZON',
    'MIMAROPA',
    'Bicol Region',
  ],
  Visayas: ['Western Visayas', 'Central Visayas', 'Eastern Visayas'],
  Mindanao: [
    'Zamboanga Peninsula',
    'Northern Mindanao',
    'Davao Region',
    'SOCCSKSARGEN',
    'Caraga',
    'BARMM',
  ],
};

// Full include for single chapter reads
const CHAPTER_INCLUDE = {
  images: { orderBy: { sort_order: 'asc' as const } },
  documents: { orderBy: { file_name: 'asc' as const } },
  officers: { orderBy: { sort_order: 'asc' as const } },
  activities: { orderBy: { date: 'desc' as const } },
  announcements: { orderBy: { date: 'desc' as const } },
};

// Lightweight include for list queries
const CHAPTER_LIST_INCLUDE = {
  images: { take: 1, orderBy: { sort_order: 'asc' as const } },
  officers: { orderBy: { sort_order: 'asc' as const } },
};

@Injectable()
export class ChaptersService {
  private readonly logger = new Logger(ChaptersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly supabase: SupabaseService,
  ) {}

  // ── Validation ──────────────────────────────────────────────────────────────

  private validateRegion(island_group: string, region: string): void {
    const validGroups = Object.keys(REGIONS_MAP);
    if (!validGroups.includes(island_group)) {
      throw new BadRequestException(
        `Invalid island_group "${island_group}". Must be one of: ${validGroups.join(', ')}`,
      );
    }
    const validRegions = REGIONS_MAP[island_group];
    if (!validRegions.includes(region)) {
      throw new BadRequestException(
        `Region "${region}" does not belong to island group "${island_group}". Valid regions: ${validRegions.join(', ')}`,
      );
    }
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 200);
  }

  private async ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
    let slug = baseSlug;
    let counter = 0;
    while (true) {
      const existing = await this.prisma.chapter.findUnique({ where: { slug } });
      if (!existing || existing.id === excludeId) break;
      counter++;
      slug = `${baseSlug}-${counter}`;
    }
    return slug;
  }

  // ── File Uploads ────────────────────────────────────────────────────────────

  private validateImageFile(file: Express.Multer.File): void {
    if (!file) throw new BadRequestException('Image file is required.');
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException('Invalid image format. Only JPG, PNG, WEBP, GIF are allowed.');
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('Image exceeds 10 MB limit.');
    }
  }

  private validateDocumentFile(file: Express.Multer.File): void {
    if (!file) throw new BadRequestException('Document file is required.');
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException('Invalid document format. Allowed: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX.');
    }
    if (file.size > 20 * 1024 * 1024) {
      throw new BadRequestException('Document exceeds 20 MB limit.');
    }
  }

  async uploadImage(file: Express.Multer.File) {
    this.validateImageFile(file);
    const url = await this.supabase.upload(file, 'governance', 'chapters/images');
    if (!url) throw new BadRequestException('Image upload failed. Please try again.');
    return {
      success: true,
      data: { url, fileName: file.originalname },
      message: 'Image uploaded successfully.',
    };
  }

  async uploadDocument(file: Express.Multer.File) {
    this.validateDocumentFile(file);
    const url = await this.supabase.upload(file, 'governance', 'chapters/documents');
    if (!url) throw new BadRequestException('Document upload failed. Please try again.');
    return {
      success: true,
      data: { url, fileName: file.originalname },
      message: 'Document uploaded successfully.',
    };
  }

  // ── Stats ───────────────────────────────────────────────────────────────────

  async getStats() {
    const [total, luzon, visayas, mindanao] = await Promise.all([
      this.prisma.chapter.count(),
      this.prisma.chapter.count({ where: { island_group: 'Luzon' } }),
      this.prisma.chapter.count({ where: { island_group: 'Visayas' } }),
      this.prisma.chapter.count({ where: { island_group: 'Mindanao' } }),
    ]);
    return {
      success: true,
      data: { total, luzon, visayas, mindanao },
      message: 'Chapter stats retrieved successfully.',
    };
  }

  // ── List ────────────────────────────────────────────────────────────────────

  async findAll(query: {
    search?: string;
    island_group?: string;
    region?: string;
    status?: string;
    sort?: string;
    page?: string;
    limit?: string;
  }) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '10', 10)));
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (query.search?.trim()) {
      const q = query.search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { short_description: { contains: q, mode: 'insensitive' } },
        { region: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (query.island_group && query.island_group !== 'All') {
      where.island_group = query.island_group;
    }
    if (query.region && query.region !== 'All') {
      where.region = query.region;
    }
    if (query.status && query.status !== 'All') {
      where.status = query.status;
    }

    // Build orderBy
    let orderBy: any = { updated_at: 'desc' };
    switch (query.sort) {
      case 'name-asc':      orderBy = { title: 'asc' }; break;
      case 'name-desc':     orderBy = { title: 'desc' }; break;
      case 'updated-asc':   orderBy = { updated_at: 'asc' }; break;
      case 'island-asc':    orderBy = { island_group: 'asc' }; break;
      case 'island-desc':   orderBy = { island_group: 'desc' }; break;
      case 'region-asc':    orderBy = { region: 'asc' }; break;
      case 'region-desc':   orderBy = { region: 'desc' }; break;
      case 'status-asc':    orderBy = { status: 'asc' }; break;
      case 'status-desc':   orderBy = { status: 'desc' }; break;
      // officers-asc/desc: requires post-sort since it's a count of relations
      default:              orderBy = { updated_at: 'desc' };
    }

    const [chapters, total] = await Promise.all([
      this.prisma.chapter.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: CHAPTER_LIST_INCLUDE,
      }),
      this.prisma.chapter.count({ where }),
    ]);

    // Handle officers sort in memory (relational count sorts not supported directly in Prisma)
    let result = chapters;
    if (query.sort === 'officers-desc' || query.sort === 'officers-asc') {
      // For officer count sort we fetch all matching records (up to limit) then sort
      const all = await this.prisma.chapter.findMany({
        where,
        include: CHAPTER_LIST_INCLUDE,
      });
      all.sort((a, b) =>
        query.sort === 'officers-desc'
          ? (b.officers?.length ?? 0) - (a.officers?.length ?? 0)
          : (a.officers?.length ?? 0) - (b.officers?.length ?? 0),
      );
      result = all.slice(skip, skip + limit);
    }

    return {
      success: true,
      data: result,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      message: 'Chapters retrieved successfully.',
    };
  }

  // ── Single ──────────────────────────────────────────────────────────────────

  async findOne(id: string) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id },
      include: CHAPTER_INCLUDE,
    });
    if (!chapter) throw new NotFoundException(`Chapter with id "${id}" not found.`);
    return { success: true, data: chapter, message: 'Chapter retrieved successfully.' };
  }

  // ── Create ──────────────────────────────────────────────────────────────────

  async create(dto: CreateChapterDto, user: { id: bigint }, ipAddress: string) {
    this.validateRegion(dto.island_group, dto.region);

    const baseSlug = this.generateSlug(dto.title);
    const slug = await this.ensureUniqueSlug(baseSlug);

    const chapter = await this.prisma.$transaction(async (tx) => {
      const ch = await tx.chapter.create({
        data: {
          title: dto.title,
          slug,
          short_description: dto.short_description,
          island_group: dto.island_group,
          region: dto.region,
          overview: dto.overview,
          mission: dto.mission ?? null,
          vision: dto.vision ?? null,
          status: 'draft',
          created_by: user.id,
          updated_by: user.id,
          images: {
            create: dto.images.map((img, idx) => ({
              file_url: img.file_url,
              file_name: img.file_name,
              sort_order: img.sort_order ?? idx,
            })),
          },
          documents: {
            create: dto.documents.map((doc) => ({
              file_url: doc.file_url,
              file_name: doc.file_name,
              file_type: doc.file_type,
            })),
          },
          officers: {
            create: (dto.officers ?? []).map((off, idx) => ({
              name: off.name,
              category_type: off.category_type,
              year_joined: Number(off.year_joined),
              sort_order: off.sort_order ?? idx,
            })),
          },
          activities: {
            create: (dto.activities ?? []).map((act) => ({
              title: act.title,
              description: act.description,
              date: new Date(act.date),
              image_url: act.image_url ?? null,
            })),
          },
          announcements: {
            create: (dto.announcements ?? []).map((ann) => ({
              title: ann.title,
              content: ann.content,
              date: new Date(ann.date),
            })),
          },
        },
        include: CHAPTER_INCLUDE,
      });
      return ch;
    });

    await this.logActivity(user.id, `Created chapter: ${chapter.title}`, ipAddress);

    return { success: true, data: chapter, message: 'Chapter created successfully.' };
  }

  // ── Update ──────────────────────────────────────────────────────────────────

  async update(id: string, dto: UpdateChapterDto, user: { id: bigint }, ipAddress: string) {
    const existing = await this.prisma.chapter.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Chapter with id "${id}" not found.`);

    // Validate region/island_group if provided
    const island_group = dto.island_group ?? existing.island_group;
    const region = dto.region ?? existing.region;
    this.validateRegion(island_group, region);

    // Re-generate slug if title changed
    let slug = existing.slug;
    if (dto.title && dto.title !== existing.title) {
      const baseSlug = this.generateSlug(dto.title);
      slug = await this.ensureUniqueSlug(baseSlug, id);
    }

    const chapter = await this.prisma.$transaction(async (tx) => {
      // Replace nested collections only if supplied in the payload
      if (dto.images !== undefined) {
        await tx.chapterImage.deleteMany({ where: { chapter_id: id } });
      }
      if (dto.documents !== undefined) {
        await tx.chapterDocument.deleteMany({ where: { chapter_id: id } });
      }
      if (dto.officers !== undefined) {
        await tx.chapterOfficer.deleteMany({ where: { chapter_id: id } });
      }
      if (dto.activities !== undefined) {
        await tx.chapterActivity.deleteMany({ where: { chapter_id: id } });
      }
      if (dto.announcements !== undefined) {
        await tx.chapterAnnouncement.deleteMany({ where: { chapter_id: id } });
      }

      const ch = await tx.chapter.update({
        where: { id },
        data: {
          title: dto.title ?? existing.title,
          slug,
          short_description: dto.short_description ?? existing.short_description,
          island_group,
          region,
          overview: dto.overview ?? existing.overview,
          mission: dto.mission !== undefined ? dto.mission : existing.mission,
          vision: dto.vision !== undefined ? dto.vision : existing.vision,
          updated_by: user.id,
          ...(dto.images !== undefined && {
            images: {
              create: dto.images.map((img, idx) => ({
                file_url: img.file_url,
                file_name: img.file_name,
                sort_order: img.sort_order ?? idx,
              })),
            },
          }),
          ...(dto.documents !== undefined && {
            documents: {
              create: dto.documents.map((doc) => ({
                file_url: doc.file_url,
                file_name: doc.file_name,
                file_type: doc.file_type,
              })),
            },
          }),
          ...(dto.officers !== undefined && {
            officers: {
              create: dto.officers.map((off, idx) => ({
                name: off.name,
                category_type: off.category_type,
                year_joined: off.year_joined,
                sort_order: off.sort_order ?? idx,
              })),
            },
          }),
          ...(dto.activities !== undefined && {
            activities: {
              create: dto.activities.map((act) => ({
                title: act.title,
                description: act.description,
                date: new Date(act.date),
                image_url: act.image_url ?? null,
              })),
            },
          }),
          ...(dto.announcements !== undefined && {
            announcements: {
              create: dto.announcements.map((ann) => ({
                title: ann.title,
                content: ann.content,
                date: new Date(ann.date),
              })),
            },
          }),
        },
        include: CHAPTER_INCLUDE,
      });
      return ch;
    });

    await this.logActivity(user.id, `Updated chapter: ${chapter.title}`, ipAddress);
    return { success: true, data: chapter, message: 'Chapter updated successfully.' };
  }

  // ── Status Toggle ───────────────────────────────────────────────────────────

  async updateStatus(id: string, dto: ChapterStatusDto, user: { id: bigint }, ipAddress: string) {
    const existing = await this.prisma.chapter.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Chapter with id "${id}" not found.`);

    const chapter = await this.prisma.chapter.update({
      where: { id },
      data: {
        status: dto.status,
        updated_by: user.id,
        published_at:
          dto.status === 'published' && existing.status !== 'published'
            ? new Date()
            : dto.status !== 'published'
            ? null
            : existing.published_at,
      },
    });

    await this.logActivity(
      user.id,
      `${dto.status === 'published' ? 'Published' : 'Unpublished'} chapter: ${chapter.title}`,
      ipAddress,
    );
    return { success: true, data: chapter, message: `Chapter status updated to "${dto.status}".` };
  }

  // ── Delete ──────────────────────────────────────────────────────────────────

  async remove(id: string, user: { id: bigint }, ipAddress: string) {
    const existing = await this.prisma.chapter.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Chapter with id "${id}" not found.`);

    await this.prisma.chapter.delete({ where: { id } });
    await this.logActivity(user.id, `Deleted chapter: ${existing.title}`, ipAddress);

    return { success: true, message: 'Chapter deleted successfully.' };
  }

  // ── Activity Logger ─────────────────────────────────────────────────────────

  private async logActivity(userId: bigint, action: string, ipAddress: string): Promise<void> {
    try {
      await this.prisma.user_activities.create({
        data: { user_id: userId, action, ip_address: ipAddress },
      });
    } catch (err) {
      this.logger.warn(`Failed to log user activity: ${err}`);
    }
  }
}
