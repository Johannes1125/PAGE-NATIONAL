import { Test, TestingModule } from '@nestjs/testing';
import { MembershipApplicationsService } from './membership-applications.service';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ValidateMembershipApplicationDto, CharacterReferenceDto, BoardReferenceDto } from './dto/validate-membership-application.dto';
import { calculateFee } from './constants/membership-fees';
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

    it('should calculate institutional fee tiers by enrollee count', () => {
      // < 500 enrollees: 1200
      expect(calculateFee('INSTITUTIONAL', 100)).toBe(1200);
      expect(calculateFee('INSTITUTIONAL', 499)).toBe(1200);
      // 500 - 999 enrollees: 2000
      expect(calculateFee('INSTITUTIONAL', 500)).toBe(2000);
      expect(calculateFee('INSTITUTIONAL', 999)).toBe(2000);
      // >= 1000 enrollees: 3000
      expect(calculateFee('INSTITUTIONAL', 1000)).toBe(3000);
      expect(calculateFee('INSTITUTIONAL', 15000)).toBe(3000);
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

    it('should validate successfully for a valid ASSOCIATE membership', async () => {
      const dto = getValidBaseData();
      dto.membershipType = MembershipType.ASSOCIATE;
      dto.currentEnrollmentStatus = 'Enrolled';
      dto.expectedGraduationYear = '2027';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail ASSOCIATE validation if enrollment fields are missing', async () => {
      const dto = getValidBaseData();
      dto.membershipType = MembershipType.ASSOCIATE;

      const errors = await validate(dto);
      const errorFields = errors.map(e => e.property);
      expect(errorFields).toContain('currentEnrollmentStatus');
      expect(errorFields).toContain('expectedGraduationYear');
      expect(errorFields).not.toContain('degreeObtained'); // not required for Associate
    });

    it('should validate successfully for a valid INSTITUTIONAL membership', async () => {
      const dto = getValidBaseData();
      dto.membershipType = MembershipType.INSTITUTIONAL;
      dto.enrolleeCount = 650;
      dto.accreditationDetails = 'PAASCU Level III';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail INSTITUTIONAL validation if enrolleeCount or accreditationDetails are missing', async () => {
      const dto = getValidBaseData();
      dto.membershipType = MembershipType.INSTITUTIONAL;

      const errors = await validate(dto);
      const errorFields = errors.map(e => e.property);
      expect(errorFields).toContain('enrolleeCount');
      expect(errorFields).toContain('accreditationDetails');
      expect(errorFields).not.toContain('degreeObtained'); // not required for Institutional
      expect(errorFields).not.toContain('ref1Name'); // not required for Institutional
    });
  });
});
