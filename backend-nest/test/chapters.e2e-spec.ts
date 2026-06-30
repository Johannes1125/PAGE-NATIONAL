import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

/**
 * Chapters E2E Test Suite
 *
 * These tests require:
 *   - A running PostgreSQL database (same as dev, or a separate test DB)
 *   - Valid SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env
 *   - At least one admin user with an api_token_hashed in the users table
 *
 * Set TEST_ADMIN_TOKEN in your .env or environment to the raw (pre-hash) token.
 * If TEST_ADMIN_TOKEN is not set, the auth-gated tests will be skipped.
 */

const ADMIN_TOKEN = process.env.TEST_ADMIN_TOKEN || '';
const skipAuth = !ADMIN_TOKEN;

/** Minimal valid chapter payload */
function validChapterPayload(overrides: Record<string, unknown> = {}) {
  return {
    title: `E2E Test Chapter ${Date.now()}`,
    short_description: 'E2E test short description for automated testing.',
    island_group: 'Luzon',
    region: 'NCR',
    overview: 'This is a comprehensive overview of the E2E test chapter.',
    images: [
      { file_url: 'https://example.com/test-image.jpg', file_name: 'test-image.jpg', sort_order: 0 },
    ],
    documents: [
      { file_url: 'https://example.com/test-doc.pdf', file_name: 'test-doc.pdf', file_type: 'application/pdf' },
    ],
    officers: [
      { name: 'Test Officer', category_type: 'President', year_joined: 2024 },
    ],
    ...overrides,
  };
}

describe('Chapters (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let createdChapterId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply the same validation pipe used in main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
      }),
    );

    await app.init();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    // Clean up any chapters created during tests
    if (createdChapterId) {
      try {
        await prisma.chapter.delete({ where: { id: createdChapterId } });
      } catch {
        // Chapter may have been deleted by a test already
      }
    }
    await app.close();
  });

  // ── PUBLIC ENDPOINTS ──────────────────────────────────────────────────────

  describe('GET /chapters', () => {
    it('should return 200 with a data array and meta', async () => {
      const res = await request(app.getHttpServer()).get('/chapters');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toHaveProperty('total');
      expect(res.body.meta).toHaveProperty('page');
    });

    it('should filter by island_group', async () => {
      const res = await request(app.getHttpServer()).get('/chapters?island_group=Luzon');
      expect(res.status).toBe(200);
      if (res.body.data.length > 0) {
        expect(res.body.data.every((c: any) => c.island_group === 'Luzon')).toBe(true);
      }
    });

    it('should filter by status', async () => {
      const res = await request(app.getHttpServer()).get('/chapters?status=published');
      expect(res.status).toBe(200);
      if (res.body.data.length > 0) {
        expect(res.body.data.every((c: any) => c.status === 'published')).toBe(true);
      }
    });
  });

  describe('GET /chapters/stats', () => {
    it('should return total/luzon/visayas/mindanao counts', async () => {
      const res = await request(app.getHttpServer()).get('/chapters/stats');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('luzon');
      expect(res.body.data).toHaveProperty('visayas');
      expect(res.body.data).toHaveProperty('mindanao');
      expect(typeof res.body.data.total).toBe('number');
    });
  });

  // ── AUTH-GATED ADMIN ENDPOINTS ────────────────────────────────────────────

  describe('POST /chapters (auth required)', () => {
    it('should return 401 when no token is provided', async () => {
      const res = await request(app.getHttpServer())
        .post('/chapters')
        .send(validChapterPayload());
      expect(res.status).toBe(401);
    });

    (skipAuth ? it.skip : it)('should create a chapter and return 201', async () => {
      const payload = validChapterPayload();
      const res = await request(app.getHttpServer())
        .post('/chapters')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.title).toBe(payload.title);
      expect(res.body.data.status).toBe('draft');
      expect(res.body.data.slug).toBeTruthy();

      createdChapterId = res.body.data.id;
    });

    (skipAuth ? it.skip : it)('should reject mismatched island_group/region with 400', async () => {
      const res = await request(app.getHttpServer())
        .post('/chapters')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
        .send(validChapterPayload({ island_group: 'Luzon', region: 'Davao Region' }));

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('does not belong to island group');
    });

    (skipAuth ? it.skip : it)('should reject an invalid island_group with 400', async () => {
      const res = await request(app.getHttpServer())
        .post('/chapters')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
        .send(validChapterPayload({ island_group: 'Mars' }));

      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /chapters/:id/status (auth required)', () => {
    it('should return 401 without token', async () => {
      const res = await request(app.getHttpServer())
        .patch('/chapters/nonexistent-id/status')
        .send({ status: 'published' });
      expect(res.status).toBe(401);
    });

    (skipAuth ? it.skip : it)('should transition draft→published and set published_at', async () => {
      if (!createdChapterId) return;

      const res = await request(app.getHttpServer())
        .patch(`/chapters/${createdChapterId}/status`)
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
        .send({ status: 'published' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('published');
      expect(res.body.data.published_at).toBeTruthy();
    });

    (skipAuth ? it.skip : it)('should transition published→draft and clear published_at', async () => {
      if (!createdChapterId) return;

      const res = await request(app.getHttpServer())
        .patch(`/chapters/${createdChapterId}/status`)
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
        .send({ status: 'draft' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('draft');
      expect(res.body.data.published_at).toBeNull();
    });

    (skipAuth ? it.skip : it)('should reject invalid status value', async () => {
      if (!createdChapterId) return;

      const res = await request(app.getHttpServer())
        .patch(`/chapters/${createdChapterId}/status`)
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
        .send({ status: 'superPublished' });

      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /chapters/:id (update/edit flow)', () => {
    it('should return 401 without token', async () => {
      const res = await request(app.getHttpServer())
        .patch('/chapters/nonexistent-id')
        .send({ title: 'New Title' });
      expect(res.status).toBe(401);
    });

    (skipAuth ? it.skip : it)('should update chapter title and preserve other fields', async () => {
      if (!createdChapterId) return;

      const newTitle = `Updated E2E Chapter ${Date.now()}`;
      const res = await request(app.getHttpServer())
        .patch(`/chapters/${createdChapterId}`)
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
        .send({ title: newTitle });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe(newTitle);
      expect(res.body.data.region).toBe('NCR'); // unchanged
    });

    (skipAuth ? it.skip : it)('should reject mismatch on update', async () => {
      if (!createdChapterId) return;

      const res = await request(app.getHttpServer())
        .patch(`/chapters/${createdChapterId}`)
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
        .send({ island_group: 'Visayas', region: 'NCR' }); // NCR not in Visayas

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /chapters/:id', () => {
    it('should return 401 without token', async () => {
      const res = await request(app.getHttpServer()).delete('/chapters/nonexistent-id');
      expect(res.status).toBe(401);
    });

    (skipAuth ? it.skip : it)('should delete the created chapter', async () => {
      if (!createdChapterId) return;

      const res = await request(app.getHttpServer())
        .delete(`/chapters/${createdChapterId}`)
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Mark as deleted so afterAll cleanup skips it
      createdChapterId = '';
    });
  });
});
