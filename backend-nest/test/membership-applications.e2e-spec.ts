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

      // 3. Save Step 2: Graduate Program Info (education-job)
      const step2Res = await request(app.getHttpServer())
        .patch(`/membership-applications/${appId}/step/education-job`)
        .send({
          currentStep: 3,
          data: {
            currentGraduateSchool: 'UPLB Graduate School',
            degreeProgram: 'MS Computer Science',
            institution: 'UPLB College', // undergraduate institution
            expectedGraduationYear: '2027',
          },
        })
        .expect(200);
      expect(step2Res.body.success).toBe(true);

      // 4. Save Step 3: Academic Info (academic-info)
      const step3Res = await request(app.getHttpServer())
        .patch(`/membership-applications/${appId}/step/academic-info`)
        .send({
          currentStep: 4,
          data: {
            currentAcademicStatus: 'enrolled',
            researchInterests: 'AI / Deep Learning',
          },
        })
        .expect(200);
      expect(step3Res.body.success).toBe(true);

      // 5. Save Step 4: Experience (experience)
      const step4Res = await request(app.getHttpServer())
        .patch(`/membership-applications/${appId}/step/experience`)
        .send({
          currentStep: 5,
          data: {
            relevantActivities: 'Member of CS Student Council',
          },
        })
        .expect(200);
      expect(step4Res.body.success).toBe(true);

      // 6. Save Step 5: References (references)
      const step5Res = await request(app.getHttpServer())
        .patch(`/membership-applications/${appId}/step/references`)
        .send({
          currentStep: 6,
          data: {
            characterReferences: [
              { name: 'Dr. John Doe', position: 'Professor', address: 'Laguna' },
              { name: 'Dr. Jane Smith', position: 'Dean', address: 'Manila' },
            ],
            regionalChapterBoardReference: {
              name: 'Dr. Board Member',
              address: 'PAGE Region IV-A',
            },
            privacyPolicyConsent: true,
          },
        })
        .expect(200);
      expect(step5Res.body.success).toBe(true);

      // 7. Document Upload: photo_1x1
      const photoDocRes = await request(app.getHttpServer())
        .post(`/membership-applications/${appId}/documents`)
        .field('documentType', 'photo_1x1')
        .attach('file', Buffer.from('mock photo content'), 'photo.jpg')
        .expect(201);
      expect(photoDocRes.body.success).toBe(true);

      // 8. Document Upload: current_enrollment_proof
      const docRes = await request(app.getHttpServer())
        .post(`/membership-applications/${appId}/documents`)
        .field('documentType', 'current_enrollment_proof')
        .attach('file', Buffer.from('mock PDF content'), 'enrollment_cert.pdf')
        .expect(201);
      expect(docRes.body.success).toBe(true);
      expect(docRes.body.data.documentType).toBe('current_enrollment_proof');

      // 9. Submit application
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

    it('should complete the full happy path for INSTITUTIONAL membership across all three fee tiers', async () => {
      // 1. Create Draft for INSTITUTIONAL
      const createRes = await request(app.getHttpServer())
        .post('/membership-applications')
        .send({ membershipType: MembershipType.INSTITUTIONAL })
        .expect(201);

      expect(createRes.body.success).toBe(true);
      const appId = createRes.body.data.id;
      createdAppIds.push(appId);
      expect(Number(createRes.body.data.feeAmount)).toBe(1200); // initial is 1200 (tier 1 fallback)

      // 2. Save Step 1: Institution Profile (profile)
      await request(app.getHttpServer())
        .patch(`/membership-applications/${appId}/step/profile`)
        .send({
          currentStep: 2,
          data: {
            collegeUniversityName: 'PAGE University',
            institutionAddress: '123 Taft Ave, Manila',
            telMobileNo: '09171234567',
            emailAddress: 'contact@page.edu.ph',
            presidentName: 'Dr. President',
            deanHeadGraduateSchool: 'Dr. Dean',
          },
        })
        .expect(200);

      // 3. Save Step 2: Academic Info (education-job) with Tier 1 enrollees (99) -> fee should remain 1200
      const step2ResTier1 = await request(app.getHttpServer())
        .patch(`/membership-applications/${appId}/step/education-job`)
        .send({
          currentStep: 3,
          data: {
            educationCoursesOffered: ['BS Computer Science'],
            graduateCoursesOffered: ['MS Computer Science'],
            totalGraduateFaculty: 15,
            currentEnrollmentCount: 99,
            enrollmentYearRange: '2025-2026',
          },
        })
        .expect(200);
      expect(Number(step2ResTier1.body.data.feeAmount)).toBe(1200);

      // 4. Save Step 2: Academic Info (education-job) with Tier 2 enrollees (150) -> fee updates to 2000
      const step2ResTier2 = await request(app.getHttpServer())
        .patch(`/membership-applications/${appId}/step/education-job`)
        .send({
          currentStep: 3,
          data: {
            educationCoursesOffered: ['BS Computer Science'],
            graduateCoursesOffered: ['MS Computer Science'],
            totalGraduateFaculty: 15,
            currentEnrollmentCount: 150,
            enrollmentYearRange: '2025-2026',
          },
        })
        .expect(200);
      expect(Number(step2ResTier2.body.data.feeAmount)).toBe(2000);

      // 5. Save Step 2: Academic Info (education-job) with Tier 3 enrollees (250) -> fee updates to 3000
      const step2ResTier3 = await request(app.getHttpServer())
        .patch(`/membership-applications/${appId}/step/education-job`)
        .send({
          currentStep: 3,
          data: {
            educationCoursesOffered: ['BS Computer Science'],
            graduateCoursesOffered: ['MS Computer Science'],
            totalGraduateFaculty: 15,
            currentEnrollmentCount: 250,
            enrollmentYearRange: '2025-2026',
          },
        })
        .expect(200);
      expect(Number(step2ResTier3.body.data.feeAmount)).toBe(3000);

      // 6. Save Step 3: Professional Affiliations (experience)
      await request(app.getHttpServer())
        .patch(`/membership-applications/${appId}/step/experience`)
        .send({
          currentStep: 4,
          data: {
            professionalAffiliations: ['Association of Graduate Schools'],
          },
        })
        .expect(200);

      // 7. Save Step 4: References
      await request(app.getHttpServer())
        .patch(`/membership-applications/${appId}/step/references`)
        .send({
          currentStep: 5,
          data: {
            privacyPolicyConsent: true,
          },
        })
        .expect(200);

      // 8. Upload Registrar Certification (sole required document)
      const uploadRes = await request(app.getHttpServer())
        .post(`/membership-applications/${appId}/documents`)
        .field('documentType', 'registrar_certification')
        .attach('file', Buffer.from('mock registrar certification PDF content'), 'registrar_cert.pdf')
        .expect(201);
      expect(uploadRes.body.success).toBe(true);
      expect(uploadRes.body.data.documentType).toBe('registrar_certification');

      // 9. Submit Application (should succeed and retain 3000 feeAmount)
      const submitRes = await request(app.getHttpServer())
        .post(`/membership-applications/${appId}/submit`)
        .expect(200);

      expect(submitRes.body.success).toBe(true);
      expect(submitRes.body.data.status).toBe('submitted');
      expect(Number(submitRes.body.data.feeAmount)).toBe(3000);
      expect(submitRes.body.data.submittedAt).toBeDefined();
    });
  });
});
