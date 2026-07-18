import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { HttpExceptionFilter } from './../src/common/http-exception.filter';
import * as crypto from 'crypto';

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

  let createdConventionId: string | undefined;
  let createdScheduleId: string;
  let createdSpeakerId: string;
  let createdAttachmentId: string;

  const validPayload = {
    convention_number: '56th Convention',
    title: 'E2E Annual Convention',
    description: 'A test convention for integration testing.',
    location: 'Cebu Convention Center',
    start_date: '2026-11-18T00:00:00.000Z',
    end_date: '2026-11-20T00:00:00.000Z',
    attachments: [
      {
        file_url: 'https://res.cloudinary.com/example/image/upload/v1/conventions/test.jpg',
        file_name: 'test.jpg',
        file_type: 'image',
      },
    ],
  };

  const validSchedulePayload = {
    schedule_date: '2026-11-19T00:00:00.000Z',
    title: 'Opening Plenary',
    event_type: 'Plenary',
    start_time: '09:00',
    end_time: '12:00',
    location: 'Main Hall',
  };

  const validSpeakerPayload = {
    name: 'Dr. Jane Doe',
    role_position: 'Keynote Speaker',
    institution: 'University of Example',
    presentation_topic: 'Future of Graduate Education',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();
    prisma = moduleFixture.get<PrismaService>(PrismaService);

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
    if (createdConventionId) {
      try {
        await prisma.convention.delete({ where: { id: createdConventionId } });
      } catch {}
    }

    if (adminUser) {
      await prisma.users.delete({ where: { id: adminUser.id } }).catch(() => {});
    }
    if (memberUser) {
      await prisma.users.delete({ where: { id: memberUser.id } }).catch(() => {});
    }

    await prisma.user_activities.deleteMany({
      where: {
        user_id: {
          in: [adminUser?.id, memberUser?.id].filter(Boolean) as bigint[],
        },
      },
    }).catch(() => {});

    await app.close();
  });

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

    it('should create a convention with default status = draft and attachments', async () => {
      const res = await request(app.getHttpServer())
        .post('/conventions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.title).toBe(validPayload.title);
      expect(res.body.data.status).toBe('draft');
      expect(res.body.data.published_at).toBeNull();
      expect(res.body.data.attachments).toHaveLength(1);

      createdConventionId = res.body.data.id;

      const logs = await prisma.user_activities.findFirst({
        where: { user_id: adminUser.id, action: 'convention_created' },
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

  describe('GET /conventions/:id/full', () => {
    it('should return convention with nested schedules, speakers, and attachments', async () => {
      const res = await request(app.getHttpServer())
        .get(`/conventions/${createdConventionId}/full`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdConventionId);
      expect(Array.isArray(res.body.data.schedules)).toBe(true);
      expect(Array.isArray(res.body.data.speakers)).toBe(true);
      expect(Array.isArray(res.body.data.attachments)).toBe(true);
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

      const logs = await prisma.user_activities.findFirst({
        where: { user_id: adminUser.id, action: 'convention_updated' },
      });
      expect(logs).toBeTruthy();
    });
  });

  describe('POST /conventions/:id/schedules', () => {
    it('should add a schedule within the convention date range', async () => {
      const res = await request(app.getHttpServer())
        .post(`/conventions/${createdConventionId}/schedules`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validSchedulePayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(validSchedulePayload.title);

      createdScheduleId = res.body.data.id;

      const logs = await prisma.user_activities.findFirst({
        where: { user_id: adminUser.id, action: 'convention_schedule_added' },
      });
      expect(logs).toBeTruthy();
    });

    it('should return 400 when schedule date is outside convention range', async () => {
      const res = await request(app.getHttpServer())
        .post(`/conventions/${createdConventionId}/schedules`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...validSchedulePayload,
          schedule_date: '2026-12-01T00:00:00.000Z',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Schedule date must fall within');
    });
  });

  describe('PATCH /conventions/:id/schedules/:scheduleId', () => {
    it('should update a schedule', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/conventions/${createdConventionId}/schedules/${createdScheduleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated Plenary Session' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Updated Plenary Session');
    });
  });

  describe('POST /conventions/:id/speakers', () => {
    it('should add a speaker', async () => {
      const res = await request(app.getHttpServer())
        .post(`/conventions/${createdConventionId}/speakers`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validSpeakerPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(validSpeakerPayload.name);

      createdSpeakerId = res.body.data.id;

      const logs = await prisma.user_activities.findFirst({
        where: { user_id: adminUser.id, action: 'convention_speaker_added' },
      });
      expect(logs).toBeTruthy();
    });
  });

  describe('PATCH /conventions/:id/speakers/:speakerId', () => {
    it('should update a speaker', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/conventions/${createdConventionId}/speakers/${createdSpeakerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Dr. John Smith' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Dr. John Smith');
    });
  });

  describe('POST /conventions/:id/attachments', () => {
    it('should return 400 when no file is provided', async () => {
      const res = await request(app.getHttpServer())
        .post(`/conventions/${createdConventionId}/attachments`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
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

      const logs = await prisma.user_activities.findFirst({
        where: { user_id: adminUser.id, action: 'convention_published' },
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

      const logs = await prisma.user_activities.findFirst({
        where: { user_id: adminUser.id, action: 'convention_unpublished' },
      });
      expect(logs).toBeTruthy();
    });
  });

  describe('DELETE /conventions/:id/speakers/:speakerId', () => {
    it('should remove a speaker', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/conventions/${createdConventionId}/speakers/${createdSpeakerId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /conventions/:id/schedules/:scheduleId', () => {
    it('should remove a schedule', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/conventions/${createdConventionId}/schedules/${createdScheduleId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /conventions/:id', () => {
    it('should remove the convention record and cascade-delete children', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/conventions/${createdConventionId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const checkConvention = await prisma.convention.findUnique({
        where: { id: createdConventionId! },
      });
      expect(checkConvention).toBeNull();

      const checkAttachments = await prisma.conventionAttachment.findMany({
        where: { convention_id: createdConventionId! },
      });
      expect(checkAttachments).toHaveLength(0);

      const logs = await prisma.user_activities.findFirst({
        where: { user_id: adminUser.id, action: 'convention_deleted' },
      });
      expect(logs).toBeTruthy();

      createdConventionId = undefined;
    });
  });
});
