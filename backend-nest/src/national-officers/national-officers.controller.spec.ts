import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { NationalOfficersController } from './national-officers.controller';
import { NationalOfficersService } from './national-officers.service';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

// ── Mock PrismaService ─────────────────────────────────────────────────────

const mockOfficer = {
  id: 'officer-1',
  memberName: 'Dr. Lino Reynoso',
  positionCategory: 'National Officers',
  role: 'President',
  description: 'PAGE President description',
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

// ── Tests ──────────────────────────────────────────────────────────────────

describe('NationalOfficersController (Integration)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [NationalOfficersController],
      providers: [
        NationalOfficersService,
        { provide: PrismaService, useValue: prismaMock },
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
          sortOrder: 3,
        },
      });

      expect(prismaMock.user_activities.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          user_id: BigInt(1), // Admin user ID
          action: 'Created National Officer: Juan Dela Cruz (Secretary)',
        }),
      });
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

  // ── DELETE /national-officers/:id ────────────────────────────────────────

  describe('DELETE /national-officers/:id', () => {
    it('deletes the officer and logs user activity', async () => {
      prismaMock.nationalOfficer.findUnique.mockResolvedValue(mockOfficer);
      prismaMock.nationalOfficer.delete.mockResolvedValue(mockOfficer);

      const response = await request(app.getHttpServer())
        .delete('/national-officers/officer-1')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(prismaMock.nationalOfficer.delete).toHaveBeenCalledWith({
        where: { id: 'officer-1' },
      });

      expect(prismaMock.user_activities.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          user_id: BigInt(1),
          action: 'Deleted National Officer: Dr. Lino Reynoso (President)',
        }),
      });
    });
  });
});
