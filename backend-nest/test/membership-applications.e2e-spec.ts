import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { CloudinaryService } from './../src/cloudinary/cloudinary.service';
import { MembershipType } from '@prisma/client';

if (!(BigInt.prototype as any).toJSON) {
  (BigInt.prototype as any).toJSON = function () {
    return Number(this);
  };
}

describe('MembershipApplications (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const createdAppIds: string[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CloudinaryService)
      .useValue({
        uploadWithPublicId: jest.fn().mockResolvedValue({
          imageUrl: 'https://example.com/test-mock-upload.pdf',
          imagePublicId: 'test-mock-public-id',
        }),
        delete: jest.fn().mockResolvedValue(true),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    // Cleanup any records created during E2E tests
    for (const appId of createdAppIds) {
      try {
        await prisma.membershipApplicationDocument.deleteMany({
          where: { applicationId: appId },
        });
        await prisma.membershipApplication.delete({
          where: { id: appId },
        });
      } catch (err) {
        // Ignore if already deleted
      }
    }
    await app.close();
  });

  describe('Lifecycle: Draft -> Step Update -> Document Upload -> Submit', () => {
    it('should complete the full happy path for ASSOCIATE membership successfully', async () => {
      // 1. Create Draft
      const createRes = await request(app.getHttpServer())
        .post('/membership-applications')
        .send({ membershipType: MembershipType.ASSOCIATE })
        .expect(201);

      expect(createRes.body.success).toBe(true);
      expect(createRes.body.data.id).toBeDefined();
      expect(createRes.body.data.membershipType).toBe('ASSOCIATE');
      expect(createRes.body.data.status).toBe('draft');
      expect(Number(createRes.body.data.feeAmount)).toBe(500); // ₱500/year

      const appId = createRes.body.data.id;
      createdAppIds.push(appId);

      // 2. Save Step 1: Profile
      const step1Res = await request(app.getHttpServer())
        .patch(`/membership-applications/${appId}/step/profile`)
        .send({
          currentStep: 2,
          data: {
            fullName: 'Associate Student',
            email: 'student@example.edu.ph',
            phone: '09171112222',
            region: 'Region IV-A',
            homeAddress: 'Los Baños, Laguna',
          },
        })
        .expect(200);
      expect(step1Res.body.success).toBe(true);

      // 3. Save Step 2: Education & Job
      const step2Res = await request(app.getHttpServer())
        .patch(`/membership-applications/${appId}/step/education-job`)
        .send({
          currentStep: 3,
          data: {
            institution: 'UPLB',
            address: 'College, Los Baños',
            presentPosition: 'Graduate Assistant',
            currentEnrollmentStatus: 'MS Student',
            expectedGraduationYear: '2027',
          },
        })
        .expect(200);
      expect(step2Res.body.success).toBe(true);

      // 4. Document Upload: current_enrollment_proof
      const docRes = await request(app.getHttpServer())
        .post(`/membership-applications/${appId}/documents`)
        .field('documentType', 'current_enrollment_proof')
        .attach('file', Buffer.from('mock PDF content'), 'enrollment_cert.pdf')
        .expect(201);
      expect(docRes.body.success).toBe(true);
      expect(docRes.body.data.documentType).toBe('current_enrollment_proof');

      // 5. Submit application
      const submitRes = await request(app.getHttpServer())
        .post(`/membership-applications/${appId}/submit`)
        .expect(200);
      expect(submitRes.body.success).toBe(true);
      expect(submitRes.body.data.status).toBe('submitted');
      expect(submitRes.body.data.submittedAt).toBeDefined();
    });

    it('should block submission if required fields are missing', async () => {
      // 1. Create Draft for LIFE
      const createRes = await request(app.getHttpServer())
        .post('/membership-applications')
        .send({ membershipType: MembershipType.LIFE })
        .expect(201);

      const appId = createRes.body.data.id;
      createdAppIds.push(appId);

      // 2. Submit right away (should fail validation with HTTP 400)
      const submitRes = await request(app.getHttpServer())
        .post(`/membership-applications/${appId}/submit`)
        .expect(400);

      expect(submitRes.body.success).toBe(false);
      expect(submitRes.body.errors).toBeDefined();
      expect(submitRes.body.errors.name).toBeDefined();
      expect(submitRes.body.errors.degreeObtained).toBeDefined();
      expect(submitRes.body.errors.photo_1x1).toBeDefined();
      expect(submitRes.body.errors.active_member_id).toBeDefined(); // doc missing
    });

    it('should complete the full happy path for LIFE membership successfully', async () => {
      // 1. Create Draft
      const createRes = await request(app.getHttpServer())
        .post('/membership-applications')
        .send({ membershipType: MembershipType.LIFE })
        .expect(201);

      expect(createRes.body.success).toBe(true);
      const appId = createRes.body.data.id;
      createdAppIds.push(appId);

      // 2. Save Profile
      await request(app.getHttpServer())
        .patch(`/membership-applications/${appId}/step/profile`)
        .send({
          currentStep: 2,
          data: {
            name: 'Life Member Person',
            emailAddress: 'lifeperson@example.edu.ph',
            telMobileNo: '09177778888',
            region: 'Region III',
            homeAddress: 'Malolos, Bulacan',
          },
        })
        .expect(200);

      // 3. Save Education & Job
      await request(app.getHttpServer())
        .patch(`/membership-applications/${appId}/step/education-job`)
        .send({
          currentStep: 3,
          data: {
            whereEmployed: 'Bulacan State University',
            businessAddress: 'Malolos, Bulacan',
            presentPosition: 'Graduate School Dean',
            degreeObtained: 'PhD in Educational Management',
            specialization: 'Higher Education',
            institution: 'University of Santo Tomas',
            yearObtained: '2015',
          },
        })
        .expect(200);

      // 4. Save Experience
      await request(app.getHttpServer())
        .patch(`/membership-applications/${appId}/step/experience`)
        .send({
          currentStep: 4,
          data: {
            yearsActiveInPAGE: 3,
            teachingExperience: [
              { institution: 'BSU', fromYear: '2016', toYear: '2026' }
            ],
            administrativeExperience: [
              { institution: 'BSU', fromYear: '2020', toYear: '2026' }
            ],
            recentPublications: [
              'Publications Article A',
              'Publications Article B'
            ],
            professionalMemberships: [
              'PAGE member',
              'Other association officer'
            ],
          },
        })
        .expect(200);

      // 5. Save References
      await request(app.getHttpServer())
        .patch(`/membership-applications/${appId}/step/references`)
        .send({
          currentStep: 5,
          data: {
            characterReferences: [
              { name: 'Dr. Character One', position: 'VP Academic', address: 'BSU Malolos' },
              { name: 'Dr. Character Two', position: 'Professor', address: 'UST Manila' }
            ],
            regionalChapterBoardReference: {
              name: 'Dr. Regional Board Member',
              address: 'PAGE Region III'
            },
            privacyPolicyConsent: true,
          },
        })
        .expect(200);

      // 6. Upload 1x1 Photo
      await request(app.getHttpServer())
        .post(`/membership-applications/${appId}/documents`)
        .field('documentType', 'photo_1x1')
        .attach('file', Buffer.from('mock 1x1 image content'), 'profile_pic.png')
        .expect(201);

      // 7. Upload active_member_id
      await request(app.getHttpServer())
        .post(`/membership-applications/${appId}/documents`)
        .field('documentType', 'active_member_id')
        .attach('file', Buffer.from('mock ID card content'), 'id_card.png')
        .expect(201);

      // 8. Submit application
      const submitRes = await request(app.getHttpServer())
        .post(`/membership-applications/${appId}/submit`)
        .expect(200);

      expect(submitRes.body.success).toBe(true);
      expect(submitRes.body.data.status).toBe('submitted');
      expect(submitRes.body.data.submittedAt).toBeDefined();
    });

    it('should complete the full happy path for REGULAR membership successfully', async () => {
      // 1. Create Draft
      const createRes = await request(app.getHttpServer())
        .post('/membership-applications')
        .send({ membershipType: MembershipType.REGULAR })
        .expect(201);

      expect(createRes.body.success).toBe(true);
      const appId = createRes.body.data.id;
      createdAppIds.push(appId);
      expect(Number(createRes.body.data.feeAmount)).toBe(2000);

      // 2. Save Profile
      await request(app.getHttpServer())
        .patch(`/membership-applications/${appId}/step/profile`)
        .send({
          currentStep: 2,
          data: {
            name: 'Regular Member Person',
            emailAddress: 'regularperson@example.edu.ph',
            telMobileNo: '09176543210',
            region: 'Region III',
            homeAddress: 'Malolos, Bulacan',
          },
        })
        .expect(200);

      // 3. Save Education & Job
      await request(app.getHttpServer())
        .patch(`/membership-applications/${appId}/step/education-job`)
        .send({
          currentStep: 3,
          data: {
            whereEmployed: 'Bulacan State University',
            businessAddress: 'Malolos, Bulacan',
            presentPosition: 'Professor',
            degreeObtained: 'Master of Science',
            specialization: 'Physics',
            institution: 'University of the Philippines',
            yearObtained: '2018',
          },
        })
        .expect(200);

      // 4. Save Experience
      await request(app.getHttpServer())
        .patch(`/membership-applications/${appId}/step/experience`)
        .send({
          currentStep: 4,
          data: {
            teachingExperience: [
              { institution: 'BSU', fromYear: '2019', toYear: '2026' }
            ],
            administrativeExperience: [],
            recentPublications: ['Physics Journal Article'],
            professionalMemberships: ['PAGE Regular Member'],
          },
        })
        .expect(200);

      // 5. Save References
      await request(app.getHttpServer())
        .patch(`/membership-applications/${appId}/step/references`)
        .send({
          currentStep: 5,
          data: {
            characterReferences: [
              { name: 'Dr. Character One', position: 'VP Academic', address: 'BSU Malolos' },
              { name: 'Dr. Character Two', position: 'Professor', address: 'UST Manila' }
            ],
            regionalChapterBoardReference: {
              name: 'Dr. Regional Board Member',
              address: 'PAGE Region III'
            },
            privacyPolicyConsent: true,
          },
        })
        .expect(200);

      // 6. Upload 1x1 Photo
      await request(app.getHttpServer())
        .post(`/membership-applications/${appId}/documents`)
        .field('documentType', 'photo_1x1')
        .attach('file', Buffer.from('mock 1x1 image content'), 'profile_pic.png')
        .expect(201);

      // 7. Submit application
      const submitRes = await request(app.getHttpServer())
        .post(`/membership-applications/${appId}/submit`)
        .expect(200);

      expect(submitRes.body.success).toBe(true);
      expect(submitRes.body.data.status).toBe('submitted');
      expect(submitRes.body.data.submittedAt).toBeDefined();
      expect(Number(submitRes.body.data.feeAmount)).toBe(2000);
    });
  });
});
