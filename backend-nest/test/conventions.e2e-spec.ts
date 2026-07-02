import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { HttpExceptionFilter } from './../src/common/http-exception.filter';
import * as crypto from 'crypto';

// Global serialization patching for Prisma BigInt IDs in E2E tests
if (!(BigInt.prototype as any).toJSON) {
  (BigInt.prototype as any).toJSON = function () {
    return Number(this);
  };
}

describe('Conventions (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  let adminToken: string;
  let adminUser: any;
  let memberToken: string;
  let memberUser: any;

  let createdConventionId: string;

  const validPayload = {
    convention_number: '56th Convention',
    title: 'E2E Annual Convention',
    location: 'Cebu Convention Center',
    convention_date: '2026-11-20T00:00:00.000Z',
    description: 'A test convention for integration testing.',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Enable same global validation pipe and filters as main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Setup temporary test users
    const rand = Date.now();
    adminToken = `test-admin-token-${rand}`;
    memberToken = `test-member-token-${rand}`;

    const adminHash = crypto.createHash('sha256').update(adminToken).digest('hex');
    const memberHash = crypto.createHash('sha256').update(memberToken).digest('hex');

    adminUser = await prisma.users.create({
      data: {
        name: 'E2E Admin',
        email: `e2eadmin-${rand}@example.com`,
        password: 'password123',
        role: 'admin',
        status: 'active',
        api_token_hashed: adminHash,
      },
    });

    memberUser = await prisma.users.create({
      data: {
        name: 'E2E Member',
        email: `e2emember-${rand}@example.com`,
        password: 'password123',
        role: 'member',
        status: 'active',
        api_token_hashed: memberHash,
      },
    });
  });

  afterAll(async () => {
    // Clean up created conventions
    if (createdConventionId) {
      try {
        await prisma.convention.delete({ where: { id: createdConventionId } });
      } catch {}
    }

    // Clean up temporary test users
    if (adminUser) {
      await prisma.users.delete({ where: { id: adminUser.id } }).catch(() => {});
    }
    if (memberUser) {
      await prisma.users.delete({ where: { id: memberUser.id } }).catch(() => {});
    }

    // Clean up user activities logged by our test users
    await prisma.user_activities.deleteMany({
      where: {
        user_id: {
          in: [adminUser?.id, memberUser?.id].filter(Boolean) as bigint[],
        },
      },
    }).catch(() => {});

    await app.close();
  });

  // ── AUTH CHECK ────────────────────────────────────────────────────────────

  describe('Authentication and Authorization', () => {
    it('should return 401 when no token is provided', async () => {
      const res = await request(app.getHttpServer())
        .post('/conventions')
        .send(validPayload);
      expect(res.status).toBe(401);
    });

    it('should return 403 when a non-admin role (member) makes a request', async () => {
      const res = await request(app.getHttpServer())
        .post('/conventions')
        .set('Authorization', `Bearer ${memberToken}`)
        .send(validPayload);
      expect(res.status).toBe(403);
    });
  });

  // ── CRUD CHECKS ───────────────────────────────────────────────────────────

  describe('POST /conventions', () => {
    it('should return 422 if required payload fields are missing', async () => {
      const invalidPayload = { title: 'Test Title' };
      const res = await request(app.getHttpServer())
        .post('/conventions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidPayload);

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBeDefined();
    });

    it('should create a convention with default status = draft', async () => {
      const res = await request(app.getHttpServer())
        .post('/conventions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validPayload);

      expect(res.status).toBe(201); // HttpStatus.CREATED is 201
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.title).toBe(validPayload.title);
      expect(res.body.data.status).toBe('draft');
      expect(res.body.data.published_at).toBeNull();

      createdConventionId = res.body.data.id;

      // Verify that activity log is created
      const logs = await prisma.user_activities.findFirst({
        where: { user_id: adminUser.id, action: `Created Convention: ${validPayload.title}` },
      });
      expect(logs).toBeTruthy();
    });
  });

  describe('GET /conventions', () => {
    it('should list all conventions', async () => {
      const res = await request(app.getHttpServer())
        .get('/conventions')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should filter conventions by status query parameter', async () => {
      const res = await request(app.getHttpServer())
        .get('/conventions?status=published')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      if (res.body.data.length > 0) {
        expect(res.body.data.every((c: any) => c.status === 'published')).toBe(true);
      }
    });
  });

  describe('GET /conventions/:id', () => {
    it('should return a convention by ID', async () => {
      const res = await request(app.getHttpServer())
        .get(`/conventions/${createdConventionId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdConventionId);
    });

    it('should return 404 for an invalid UUID or missing convention', async () => {
      const missingId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app.getHttpServer())
        .get(`/conventions/${missingId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /conventions/:id', () => {
    it('should update partial fields of a convention', async () => {
      const updatePayload = { title: 'Updated E2E Convention Title' };
      const res = await request(app.getHttpServer())
        .patch(`/conventions/${createdConventionId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatePayload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(updatePayload.title);

      // Verify that activity log is created
      const logs = await prisma.user_activities.findFirst({
        where: { user_id: adminUser.id, action: `Updated Convention: ${updatePayload.title}` },
      });
      expect(logs).toBeTruthy();
    });
  });

  describe('PATCH /conventions/:id/publish', () => {
    it('should set status to published and update published_at', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/conventions/${createdConventionId}/publish`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('published');
      expect(res.body.data.published_at).not.toBeNull();

      // Verify that activity log is created
      const logs = await prisma.user_activities.findFirst({
        where: { user_id: adminUser.id, action: `Published Convention: ${res.body.data.title}` },
      });
      expect(logs).toBeTruthy();
    });
  });

  describe('PATCH /conventions/:id/unpublish', () => {
    it('should revert status to draft and clear published_at', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/conventions/${createdConventionId}/unpublish`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('draft');
      expect(res.body.data.published_at).toBeNull();

      // Verify that activity log is created
      const logs = await prisma.user_activities.findFirst({
        where: { user_id: adminUser.id, action: `Unpublished Convention: ${res.body.data.title}` },
      });
      expect(logs).toBeTruthy();
    });
  });

  describe('DELETE /conventions/:id', () => {
    it('should remove the convention record and return 200', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/conventions/${createdConventionId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify it is removed
      const checkRes = await prisma.convention.findUnique({
        where: { id: createdConventionId },
      });
      expect(checkRes).toBeNull();

      // Verify that activity log is created
      const logs = await prisma.user_activities.findFirst({
        where: { user_id: adminUser.id, action: `Deleted Convention: ${res.body.data.title}` },
      });
      expect(logs).toBeTruthy();

      createdConventionId = null; // Clear so afterAll doesn't try to delete it
    });
  });
});
