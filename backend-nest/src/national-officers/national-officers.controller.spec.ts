import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { NationalOfficersController } from './national-officers.controller';
import { NationalOfficersService } from './national-officers.service';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import * as crypto from 'crypto';

// ── Mock PrismaService ─────────────────────────────────────────────────────

const mockOfficer = {
  id: 'officer-1',
  memberName: 'Dr. Lino Reynoso',
  positionCategory: 'National Officers',
  role: 'President',
  description: 'PAGE President description',
  imageUrl: 'https://example.com/officer.jpg',
  sortOrder: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const adminTokenHash = crypto.createHash('sha256').update('admin-token').digest('hex');
const memberTokenHash = crypto.createHash('sha256').update('member-token').digest('hex');

const prismaMock = {
  nationalOfficer: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  user_activities: {
    create: jest.fn(),
  },
  users: {
    findFirst: jest.fn(),
  },
};

const supabaseMock = {
  upload: jest.fn().mockResolvedValue('https://example.com/uploaded.jpg'),
};

const cloudinaryMock = {
  upload: jest.fn().mockResolvedValue('https://example.com/uploaded.jpg'),
};

// ── Tests ──────────────────────────────────────────────────────────────────

describe('NationalOfficersController (Integration)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [NationalOfficersController],
      providers: [
        NationalOfficersService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: SupabaseService, useValue: supabaseMock },
        { provide: CloudinaryService, useValue: cloudinaryMock },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementation for TokenAuthGuard queries
    prismaMock.users.findFirst.mockImplementation(({ where }) => {
      if (where.api_token_hashed === adminTokenHash && where.status === 'active') {
        return Promise.resolve({ id: BigInt(1), role: 'admin', status: 'active' });
      }
      if (where.api_token_hashed === memberTokenHash && where.status === 'active') {
        return Promise.resolve({ id: BigInt(2), role: 'member', status: 'active' });
      }
      return Promise.resolve(null);
    });
  });

  afterAll(async () => {
    await app.close();
  });

  // ── GET /national-officers ────────────────────────────────────────────────

  describe('GET /national-officers', () => {
    it('returns all officers sorted and publicly accessible', async () => {
      const mockList = [
        { ...mockOfficer, role: 'President', sortOrder: 1 },
        { ...mockOfficer, id: 'officer-2', memberName: 'Juan Secretary', role: 'Secretary', sortOrder: 3 },
      ];
      prismaMock.nationalOfficer.findMany.mockResolvedValue(mockList);

      const response = await request(app.getHttpServer())
        .get('/national-officers')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(prismaMock.nationalOfficer.findMany).toHaveBeenCalledWith({
        where: { status: { not: 'archived' } },
        orderBy: [
          { positionCategory: 'desc' },
          { sortOrder: 'asc' },
        ],
      });
    });
  });

  // ── GET /national-officers/:id ───────────────────────────────────────────

  describe('GET /national-officers/:id', () => {
    it('returns a single officer', async () => {
      prismaMock.nationalOfficer.findUnique.mockResolvedValue(mockOfficer);

      const response = await request(app.getHttpServer())
        .get('/national-officers/officer-1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.memberName).toBe('Dr. Lino Reynoso');
    });

    it('returns 404 when officer does not exist', async () => {
      prismaMock.nationalOfficer.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get('/national-officers/non-existent')
        .expect(404);
    });
  });

  // ── POST /national-officers ───────────────────────────────────────────────

  describe('POST /national-officers', () => {
    it('returns 401 if unauthorized (missing/invalid token)', async () => {
      await request(app.getHttpServer())
        .post('/national-officers')
        .send({
          memberName: 'Test Name',
          positionCategory: 'National Officers',
          role: 'Treasurer',
        })
        .expect(401);
    });

    it('returns 403 if authorized user is not an admin', async () => {
      await request(app.getHttpServer())
        .post('/national-officers')
        .set('Authorization', 'Bearer member-token')
        .send({
          memberName: 'Test Name',
          positionCategory: 'National Officers',
          role: 'Treasurer',
        })
        .expect(403);
    });

    it('returns 400 when validation rules fail', async () => {
      // 1. Missing required field memberName
      await request(app.getHttpServer())
        .post('/national-officers')
        .set('Authorization', 'Bearer admin-token')
        .send({
          positionCategory: 'National Officers',
          role: 'Treasurer',
        })
        .expect(400);

      // 2. Invalid positionCategory
      await request(app.getHttpServer())
        .post('/national-officers')
        .set('Authorization', 'Bearer admin-token')
        .send({
          memberName: 'Test Name',
          positionCategory: 'Arbitrary Category',
          role: 'Treasurer',
        })
        .expect(400);

      // 3. Invalid role
      await request(app.getHttpServer())
        .post('/national-officers')
        .set('Authorization', 'Bearer admin-token')
        .send({
          memberName: 'Test Name',
          positionCategory: 'National Officers',
          role: 'Chairman',
        })
        .expect(400);
    });

    it('creates an officer, computes sortOrder, and logs user activity', async () => {
      const payload = {
        memberName: 'Juan Dela Cruz',
        positionCategory: 'National Officers',
        role: 'Secretary',
        description: 'New secretary bio',
      };

      const createdResponse = {
        id: 'officer-sec',
        ...payload,
        sortOrder: 3, // Secretary maps to 3
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.nationalOfficer.create.mockResolvedValue(createdResponse);
      prismaMock.user_activities.create.mockResolvedValue({});

      const response = await request(app.getHttpServer())
        .post('/national-officers')
        .set('Authorization', 'Bearer admin-token')
        .send(payload)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.role).toBe('Secretary');
      expect(response.body.data.sortOrder).toBe(3); // Secretary = 3
      expect(prismaMock.nationalOfficer.create).toHaveBeenCalledWith({
        data: {
          memberName: payload.memberName,
          positionCategory: payload.positionCategory,
          role: payload.role,
          description: payload.description,
          imageUrl: null,
          sortOrder: 3,
          status: 'active',
        },
      });

      expect(prismaMock.user_activities.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          user_id: BigInt(1), // Admin user ID
          action: 'Created National Officer: Juan Dela Cruz (Secretary)',
        }),
      });
    });

    it('uploads officer photo successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/national-officers/upload')
        .set('Authorization', 'Bearer admin-token')
        .attach('image', Buffer.from('fake image data'), 'officer.jpg')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.imageUrl).toBeDefined();
    });
  });

  // ── PATCH /national-officers/:id ──────────────────────────────────────────

  describe('PATCH /national-officers/:id', () => {
    it('updates officer and recalculates sortOrder when role is modified', async () => {
      const existing = {
        id: 'officer-update',
        memberName: 'Juan Dela Cruz',
        positionCategory: 'National Officers',
        role: 'Secretary',
        description: 'Secretary bio',
        sortOrder: 3,
      };

      const payload = {
        role: 'President', // Promote Secretary to President
      };

      const updated = {
        ...existing,
        role: 'President',
        sortOrder: 1, // Recalculated President = 1
      };

      prismaMock.nationalOfficer.findUnique.mockResolvedValue(existing);
      prismaMock.nationalOfficer.update.mockResolvedValue(updated);

      const response = await request(app.getHttpServer())
        .patch('/national-officers/officer-update')
        .set('Authorization', 'Bearer admin-token')
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.role).toBe('President');
      expect(response.body.data.sortOrder).toBe(1);

      expect(prismaMock.nationalOfficer.update).toHaveBeenCalledWith({
        where: { id: 'officer-update' },
        data: expect.objectContaining({
          role: 'President',
          sortOrder: 1,
        }),
      });

      expect(prismaMock.user_activities.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          user_id: BigInt(1),
          action: 'Updated National Officer: Juan Dela Cruz (President)',
        }),
      });
    });
  });

  // ── PATCH /national-officers/:id/archive ─────────────────────────────────

  describe('PATCH /national-officers/:id/archive', () => {
    it('archives the officer and logs user activity', async () => {
      const activeOfficer = { ...mockOfficer, status: 'active' };
      prismaMock.nationalOfficer.findUnique.mockResolvedValue(activeOfficer);
      prismaMock.nationalOfficer.update.mockResolvedValue({ ...activeOfficer, status: 'archived' });

      const response = await request(app.getHttpServer())
        .patch('/national-officers/officer-1/archive')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(prismaMock.nationalOfficer.update).toHaveBeenCalledWith({
        where: { id: 'officer-1' },
        data: { status: 'archived' },
      });

      expect(prismaMock.user_activities.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          user_id: BigInt(1),
          action: 'archived_national_officer: Dr. Lino Reynoso (President)',
        }),
      });
    });
  });

  // ── PATCH /national-officers/:id/unarchive ───────────────────────────────

  describe('PATCH /national-officers/:id/unarchive', () => {
    it('unarchives the officer and logs user activity', async () => {
      const archivedOfficer = { ...mockOfficer, status: 'archived' };
      prismaMock.nationalOfficer.findUnique.mockResolvedValue(archivedOfficer);
      prismaMock.nationalOfficer.update.mockResolvedValue({ ...archivedOfficer, status: 'active' });

      const response = await request(app.getHttpServer())
        .patch('/national-officers/officer-1/unarchive')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(prismaMock.nationalOfficer.update).toHaveBeenCalledWith({
        where: { id: 'officer-1' },
        data: { status: 'active' },
      });

      expect(prismaMock.user_activities.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          user_id: BigInt(1),
          action: 'unarchived_national_officer: Dr. Lino Reynoso (President)',
        }),
      });
    });
  });
});
