import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import * as crypto from 'crypto';

if (!(BigInt.prototype as any).toJSON) {
  (BigInt.prototype as any).toJSON = function () {
    return Number(this);
  };
}

describe('Notifications (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const adminTokenRaw = `test_admin_token_${Date.now()}`;
  const memberTokenRaw = `test_member_token_${Date.now()}`;

  const adminTokenHashed = crypto.createHash('sha256').update(adminTokenRaw).digest('hex');
  const memberTokenHashed = crypto.createHash('sha256').update(memberTokenRaw).digest('hex');

  let adminUserId: bigint;
  let memberUserId: bigint;
  let testPostId: bigint;
  let testMessageId: bigint;
  const createdNotificationIds: string[] = [];

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
    await app.init();
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Create test admin user
    const adminUser = await prisma.users.create({
      data: {
        name: `Test Admin Notif ${Date.now()}`,
        email: `test-admin-notif-${Date.now()}@example.com`,
        password: 'hashed_password_placeholder',
        role: 'admin',
        status: 'active',
        api_token_hashed: adminTokenHashed,
      },
    });
    adminUserId = adminUser.id;

    // Create test member user
    const memberUser = await prisma.users.create({
      data: {
        name: `Test Member Notif ${Date.now()}`,
        email: `test-member-notif-${Date.now()}@example.com`,
        password: 'hashed_password_placeholder',
        role: 'member',
        status: 'active',
        api_token_hashed: memberTokenHashed,
      },
    });
    memberUserId = memberUser.id;

    // Create a pending post
    const post = await prisma.posts.create({
      data: {
        user_id: memberUserId,
        title: `Test Pending Post ${Date.now()}`,
        category: 'Research',
        author: 'Test Member',
        content_html: '<p>Test content</p>',
        status: 'pending',
      },
    });
    testPostId = post.id;

    // Create an inbound message from member
    const msg = await prisma.messages.create({
      data: {
        conversation_id: `conv_${Date.now()}`,
        sender_id: memberUserId,
        receiver_id: adminUserId,
        subject: 'Inquiry Subject',
        text: 'This is a test notification message from member.',
        status: 'sent',
      },
    });
    testMessageId = msg.id;
  });

  afterAll(async () => {
    // Cleanup created notifications
    if (createdNotificationIds.length > 0) {
      await prisma.notification.deleteMany({
        where: { id: { in: createdNotificationIds } },
      }).catch(() => {});
    }

    // Cleanup test post & message
    if (testPostId) {
      await prisma.posts.delete({ where: { id: testPostId } }).catch(() => {});
    }
    if (testMessageId) {
      await prisma.messages.delete({ where: { id: testMessageId } }).catch(() => {});
    }

    // Cleanup test users
    if (memberUserId) {
      await prisma.users.delete({ where: { id: memberUserId } }).catch(() => {});
    }
    if (adminUserId) {
      await prisma.users.delete({ where: { id: adminUserId } }).catch(() => {});
    }

    await app.close();
  });

  describe('Security & Access Control', () => {
    it('should reject unauthorized requests with 401 when no token is provided', async () => {
      await request(app.getHttpServer())
        .get('/notifications')
        .expect(401);
    });

    it('should reject non-admin users with 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .get('/notifications')
        .set('Authorization', `Bearer ${memberTokenRaw}`)
        .expect(403);
    });

    it('should allow admin users with 200 OK', async () => {
      const res = await request(app.getHttpServer())
        .get('/notifications')
        .set('Authorization', `Bearer ${adminTokenRaw}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /notifications aggregation and sorting', () => {
    it('should return merged feed containing pending posts and messages with correct fields', async () => {
      const res = await request(app.getHttpServer())
        .get('/notifications')
        .set('Authorization', `Bearer ${adminTokenRaw}`)
        .expect(200);

      const items = res.body.data;
      expect(items.length).toBeGreaterThan(0);

      // Check chronological sort order (newest first)
      for (let i = 0; i < items.length - 1; i++) {
        const dateA = new Date(items[i].createdAt).getTime();
        const dateB = new Date(items[i + 1].createdAt).getTime();
        expect(dateA).toBeGreaterThanOrEqual(dateB);
      }

      // Check pending post item exists
      const postItem = items.find((item: any) => item.id === `post_pending:${testPostId}`);
      expect(postItem).toBeDefined();
      expect(postItem.type).toBe('post_pending');
      expect(postItem.source).toBe('approve-post');
      expect(postItem.isRead).toBe(false);
      expect(postItem.isDeleted).toBe(false);

      // Check message item exists
      const msgItem = items.find((item: any) => item.id === `message:${testMessageId}`);
      expect(msgItem).toBeDefined();
      expect(msgItem.type).toBe('message');
      expect(msgItem.source).toBe('messages');
    });
  });

  describe('PATCH /notifications/:id/read', () => {
    it('should mark a notification as read and persist the state', async () => {
      const targetId = `post_pending:${testPostId}`;
      createdNotificationIds.push(targetId);

      const patchRes = await request(app.getHttpServer())
        .patch(`/notifications/${encodeURIComponent(targetId)}/read`)
        .set('Authorization', `Bearer ${adminTokenRaw}`)
        .expect(200);

      expect(patchRes.body.success).toBe(true);
      expect(patchRes.body.data.id).toBe(targetId);
      expect(patchRes.body.data.isRead).toBe(true);

      // Subsequent GET should reflect isRead = true
      const getRes = await request(app.getHttpServer())
        .get('/notifications')
        .set('Authorization', `Bearer ${adminTokenRaw}`)
        .expect(200);

      const updatedItem = getRes.body.data.find((item: any) => item.id === targetId);
      expect(updatedItem).toBeDefined();
      expect(updatedItem.isRead).toBe(true);
    });
  });

  describe('DELETE /notifications/:id and POST /notifications/batch-delete', () => {
    it('should delete a single notification and exclude it from future feeds', async () => {
      const targetId = `message:${testMessageId}`;
      createdNotificationIds.push(targetId);

      const deleteRes = await request(app.getHttpServer())
        .delete(`/notifications/${encodeURIComponent(targetId)}`)
        .set('Authorization', `Bearer ${adminTokenRaw}`)
        .expect(200);

      expect(deleteRes.body.success).toBe(true);
      expect(deleteRes.body.data.isDeleted).toBe(true);

      // Subsequent GET should no longer return this notification
      const getRes = await request(app.getHttpServer())
        .get('/notifications')
        .set('Authorization', `Bearer ${adminTokenRaw}`)
        .expect(200);

      const deletedItem = getRes.body.data.find((item: any) => item.id === targetId);
      expect(deletedItem).toBeUndefined();
    });

    it('should batch-delete notifications and persist deleted state', async () => {
      const targetId = `post_pending:${testPostId}`;
      createdNotificationIds.push(targetId);

      const batchRes = await request(app.getHttpServer())
        .post('/notifications/batch-delete')
        .set('Authorization', `Bearer ${adminTokenRaw}`)
        .send({ ids: [targetId] })
        .expect(200);

      expect(batchRes.body.success).toBe(true);
      expect(batchRes.body.data.deletedCount).toBe(1);

      // Subsequent GET should no longer include the batch-deleted item
      const getRes = await request(app.getHttpServer())
        .get('/notifications')
        .set('Authorization', `Bearer ${adminTokenRaw}`)
        .expect(200);

      const deletedItem = getRes.body.data.find((item: any) => item.id === targetId);
      expect(deletedItem).toBeUndefined();
    });
  });
});
