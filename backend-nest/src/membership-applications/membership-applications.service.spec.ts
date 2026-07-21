import { Test, TestingModule } from '@nestjs/testing';
import { MembershipApplicationsService } from './membership-applications.service';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ValidateMembershipApplicationDto, CharacterReferenceDto, BoardReferenceDto } from './dto/validate-membership-application.dto';
import { calculateFee, computeInstitutionalFee } from './constants/membership-fees';
import { validate } from 'class-validator';
import { MembershipType } from '@prisma/client';

describe('MembershipApplications Service & DTO Unit Tests', () => {
  let service: MembershipApplicationsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const mockPrisma = {
      membershipApplication: {
        create: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      membershipApplicationDocument: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    const mockCloudinary = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembershipApplicationsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CloudinaryService, useValue: mockCloudinary },
      ],
    }).compile();

    service = module.get<MembershipApplicationsService>(MembershipApplicationsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('Fee Calculation Tiers', () => {
    it('should calculate individual type fees correctly', () => {
      expect(calculateFee('LIFE')).toBe(5000);
      expect(calculateFee('REGULAR')).toBe(2000);
      expect(calculateFee('ASSOCIATE')).toBe(500);
    });

    it('should calculate institutional fee tiers using computeInstitutionalFee at boundaries (99, 100, 101, 200, 201)', () => {
      expect(computeInstitutionalFee(99)).toBe(1200);
      expect(computeInstitutionalFee(100)).toBe(1200);
      expect(computeInstitutionalFee(101)).toBe(2000);
      expect(computeInstitutionalFee(200)).toBe(2000);
      expect(computeInstitutionalFee(201)).toBe(3000);
    });

    it('should calculate institutional fee tiers by enrollee count via calculateFee', () => {
      expect(calculateFee('INSTITUTIONAL', 50)).toBe(1200);
      expect(calculateFee('INSTITUTIONAL', 150)).toBe(2000);
      expect(calculateFee('INSTITUTIONAL', 250)).toBe(3000);
    });
  });

  describe('Conditional DTO Validation', () => {
    const getValidBaseData = () => {
      const base = new ValidateMembershipApplicationDto();
      base.fullName = 'Jane Doe';
      base.email = 'jane.doe@example.com';
      base.phone = '09171234567';
      base.region = 'NCR';
      base.homeAddress = 'Manila';
      base.institution = 'UST';
      base.address = 'España';
      base.presentPosition = 'Professor';
      return base;
    };

    const getValidIndividualData = (type: MembershipType) => {
      const dto = new ValidateMembershipApplicationDto();
      dto.membershipType = type;
      dto.name = 'Jane Doe';
      dto.telMobileNo = '09171234567';
      dto.emailAddress = 'jane.doe@example.com';
      dto.lifeRegion = 'NCR';
      dto.lifeHomeAddress = 'Manila';
      dto.whereEmployed = 'UST';
      dto.businessAddress = 'España';
      dto.presentPosition = 'Professor';
      
      dto.degreeObtained = 'PhD';
      dto.specialization = 'Computer Science';
      dto.institution = 'UP';
      dto.yearObtained = '2020';
      
      const ref1 = new CharacterReferenceDto();
      ref1.name = 'Dr. Smith';
      ref1.position = 'Dean';
      ref1.address = 'Manila';

      const ref2 = new CharacterReferenceDto();
      ref2.name = 'Dr. Adams';
      ref2.position = 'Officer';
      ref2.address = 'Quezon City';

      dto.characterReferences = [ref1, ref2];

      const boardRef = new BoardReferenceDto();
      boardRef.name = 'Dr. Board';
      boardRef.address = 'Davao';
      dto.regionalChapterBoardReference = boardRef;
      
      dto.privacyPolicyConsent = true;

      if (type === MembershipType.LIFE) {
        dto.yearsActiveInPAGE = 2;
      }
      return dto;
    };

    it.each([MembershipType.LIFE, MembershipType.REGULAR])(
      'should validate successfully for a valid %s membership',
      async (type) => {
        const dto = getValidIndividualData(type);
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      },
    );

    it.each([MembershipType.LIFE, MembershipType.REGULAR])(
      'should fail %s validation if shared fields are missing',
      async (type) => {
        const dto = new ValidateMembershipApplicationDto();
        dto.membershipType = type;

        const errors = await validate(dto);
        const errorFields = errors.map(e => e.property);
        expect(errorFields).toContain('name');
        expect(errorFields).toContain('telMobileNo');
        expect(errorFields).toContain('emailAddress');
        expect(errorFields).toContain('lifeRegion');
        expect(errorFields).toContain('lifeHomeAddress');
        expect(errorFields).toContain('whereEmployed');
        expect(errorFields).toContain('businessAddress');
        expect(errorFields).toContain('degreeObtained');
        expect(errorFields).toContain('characterReferences');
        expect(errorFields).toContain('regionalChapterBoardReference');
        expect(errorFields).toContain('privacyPolicyConsent');
      },
    );

    it('should fail LIFE validation if yearsActiveInPAGE is missing but pass REGULAR if yearsActiveInPAGE is missing', async () => {
      const lifeDto = getValidIndividualData(MembershipType.LIFE);
      delete lifeDto.yearsActiveInPAGE;
      const lifeErrors = await validate(lifeDto);
      expect(lifeErrors.map(e => e.property)).toContain('yearsActiveInPAGE');

      const regDto = getValidIndividualData(MembershipType.REGULAR);
      delete regDto.yearsActiveInPAGE;
      const regErrors = await validate(regDto);
      expect(regErrors.map(e => e.property)).not.toContain('yearsActiveInPAGE');
    });

    const getValidAssociateData = () => {
      const dto = new ValidateMembershipApplicationDto();
      dto.membershipType = MembershipType.ASSOCIATE;
      dto.fullName = 'Jane Doe';
      dto.email = 'jane.doe@example.com';
      dto.phone = '09171234567';
      dto.region = 'NCR';
      dto.homeAddress = 'Manila';
      dto.institution = 'UST'; // undergraduate institution

      // Student fields
      dto.currentGraduateSchool = 'UST GS';
      dto.degreeProgram = 'MS CS';
      dto.expectedGraduationYear = '2027';
      dto.currentAcademicStatus = 'enrolled';
      dto.researchInterests = 'AI / Machine Learning';

      // References & Consent
      const ref1 = new CharacterReferenceDto();
      ref1.name = 'Dr. Smith';
      ref1.position = 'Dean';
      ref1.address = 'Manila';

      const ref2 = new CharacterReferenceDto();
      ref2.name = 'Dr. Adams';
      ref2.position = 'Officer';
      ref2.address = 'Quezon City';

      dto.characterReferences = [ref1, ref2];

      const boardRef = new BoardReferenceDto();
      boardRef.name = 'Dr. Board';
      boardRef.address = 'Davao';
      dto.regionalChapterBoardReference = boardRef;
      
      dto.privacyPolicyConsent = true;

      return dto;
    };

    it('should validate successfully for a valid ASSOCIATE membership', async () => {
      const dto = getValidAssociateData();

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail ASSOCIATE validation if program or academic status fields are missing', async () => {
      const dto = getValidAssociateData();
      delete dto.currentGraduateSchool;
      delete dto.degreeProgram;
      delete dto.currentAcademicStatus;

      const errors = await validate(dto);
      const errorFields = errors.map(e => e.property);
      expect(errorFields).toContain('currentGraduateSchool');
      expect(errorFields).toContain('degreeProgram');
      expect(errorFields).toContain('currentAcademicStatus');
      expect(errorFields).not.toContain('researchInterests'); // optional
    });

    it('should fail ASSOCIATE validation if references or consent are missing', async () => {
      const dto = getValidAssociateData();
      delete dto.characterReferences;
      delete dto.privacyPolicyConsent;

      const errors = await validate(dto);
      const errorFields = errors.map(e => e.property);
      expect(errorFields).toContain('characterReferences');
      expect(errorFields).toContain('privacyPolicyConsent');
    });

    const getValidInstitutionalData = () => {
      const dto = new ValidateMembershipApplicationDto();
      dto.membershipType = MembershipType.INSTITUTIONAL;
      dto.collegeUniversityName = 'PAGE University';
      dto.institutionAddress = '123 Taft Ave, Manila';
      dto.telMobileNo = '09171234567';
      dto.emailAddress = 'contact@page.edu.ph';
      dto.presidentName = 'Dr. President';
      dto.deanHeadGraduateSchool = 'Dr. Dean';

      dto.educationCoursesOffered = ['BS CS', 'BS IT'];
      dto.graduateCoursesOffered = ['MS CS', 'PhD IT'];
      dto.totalGraduateFaculty = 50;
      dto.currentEnrollmentCount = 150;
      dto.enrollmentYearRange = '2025-2026';

      dto.professionalAffiliations = ['Affiliation A'];

      const ref1 = new CharacterReferenceDto();
      ref1.name = 'Dr. Smith';
      ref1.position = 'Dean';
      ref1.address = 'Manila';

      const ref2 = new CharacterReferenceDto();
      ref2.name = 'Dr. Adams';
      ref2.position = 'Officer';
      ref2.address = 'Quezon City';

      dto.characterReferences = [ref1, ref2];

      const boardRef = new BoardReferenceDto();
      boardRef.name = 'Dr. Board';
      boardRef.address = 'Davao';
      dto.regionalChapterBoardReference = boardRef;
      
      dto.privacyPolicyConsent = true;

      return dto;
    };

    it('should validate successfully for a valid INSTITUTIONAL membership', async () => {
      const dto = getValidInstitutionalData();
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail INSTITUTIONAL validation if required fields are missing', async () => {
      const dto = new ValidateMembershipApplicationDto();
      dto.membershipType = MembershipType.INSTITUTIONAL;

      const errors = await validate(dto);
      const errorFields = errors.map(e => e.property);
      
      expect(errorFields).toContain('collegeUniversityName');
      expect(errorFields).toContain('institutionAddress');
      expect(errorFields).toContain('telMobileNo');
      expect(errorFields).toContain('emailAddress');
      expect(errorFields).toContain('presidentName');
      expect(errorFields).toContain('deanHeadGraduateSchool');

      expect(errorFields).toContain('educationCoursesOffered');
      expect(errorFields).toContain('graduateCoursesOffered');
      expect(errorFields).toContain('totalGraduateFaculty');
      expect(errorFields).toContain('currentEnrollmentCount');
      expect(errorFields).toContain('enrollmentYearRange');

      expect(errorFields).not.toContain('characterReferences');
      expect(errorFields).not.toContain('regionalChapterBoardReference');
      expect(errorFields).toContain('privacyPolicyConsent');

      expect(errorFields).not.toContain('professionalAffiliations'); // optional
      expect(errorFields).not.toContain('degreeObtained'); // not required for Institutional
      expect(errorFields).not.toContain('fullName'); // not required for Institutional
    });
  });
});
