import { Test, TestingModule } from '@nestjs/testing';
import { BirCertificationsService } from './bir-certifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('BirCertificationsService', () => {
  let service: BirCertificationsService;
  let prisma: PrismaService;
  let cloudinary: CloudinaryService;

  const mockPrismaService = {
    birCertification: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user_activities: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockCloudinaryService = {
    uploadWithPublicId: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BirCertificationsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CloudinaryService, useValue: mockCloudinaryService },
      ],
    }).compile();

    service = module.get<BirCertificationsService>(BirCertificationsService);
    prisma = module.get<PrismaService>(PrismaService);
    cloudinary = module.get<CloudinaryService>(CloudinaryService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a record and log activity', async () => {
      const dto = {
        registrationName: 'Test Reg',
        tinNumber: '123-456',
        certificationNumber: 'CERT-999',
        exemptionCategory: 'Non-stock',
        dateOfIssuance: '2026-06-01T00:00:00.000Z',
      };
      const file = { buffer: Buffer.from('test') } as Express.Multer.File;
      const user = { id: 1n };
      const ip = '127.0.0.1';

      mockCloudinaryService.uploadWithPublicId.mockResolvedValue({
        imageUrl: 'http://cloudinary.com/test.png',
        imagePublicId: 'test_id',
      });

      const createdRecord = {
        id: 'uuid-123',
        ...dto,
        dateOfIssuance: new Date(dto.dateOfIssuance),
        imageUrl: 'http://cloudinary.com/test.png',
        imagePublicId: 'test_id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.birCertification.create.mockResolvedValue(createdRecord);
      mockPrismaService.user_activities.create.mockResolvedValue({});

      const result = await service.create(dto, file, user, ip);

      expect(cloudinary.uploadWithPublicId).toHaveBeenCalledWith(file, 'bir_certifications');
      expect(prisma.birCertification.create).toHaveBeenCalled();
      expect(prisma.user_activities.create).toHaveBeenCalledWith({
        data: {
          user_id: user.id,
          action: 'CREATE_BIR_CERTIFICATION',
          ip_address: ip,
        },
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(createdRecord);
    });

    it('should throw BadRequestException if cloudinary upload fails', async () => {
      const dto = {
        registrationName: 'Test Reg',
        tinNumber: '123-456',
        certificationNumber: 'CERT-999',
        exemptionCategory: 'Non-stock',
        dateOfIssuance: '2026-06-01T00:00:00.000Z',
      };
      const file = { buffer: Buffer.from('test') } as Express.Multer.File;

      mockCloudinaryService.uploadWithPublicId.mockResolvedValue(null);

      await expect(service.create(dto, file, { id: 1n }, '127.0.0.1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all records ordered by dateOfIssuance descending', async () => {
      const records = [
        { id: '1', dateOfIssuance: new Date('2026-06-02') },
        { id: '2', dateOfIssuance: new Date('2026-06-01') },
      ];
      mockPrismaService.birCertification.findMany.mockResolvedValue(records);

      const result = await service.findAll();

      expect(prisma.birCertification.findMany).toHaveBeenCalledWith({
        orderBy: { dateOfIssuance: 'desc' },
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(records);
    });
  });

  describe('findOne', () => {
    it('should return a record by id', async () => {
      const record = { id: 'uuid-123' };
      mockPrismaService.birCertification.findUnique.mockResolvedValue(record);

      const result = await service.findOne('uuid-123');

      expect(prisma.birCertification.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(record);
    });

    it('should throw NotFoundException if record not found', async () => {
      mockPrismaService.birCertification.findUnique.mockResolvedValue(null);

      await expect(service.findOne('uuid-123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update the record and delete old image if new image is uploaded', async () => {
      const existing = {
        id: 'uuid-123',
        imagePublicId: 'old_pub_id',
        imageUrl: 'old_url',
      };
      const dto = { registrationName: 'New Name' };
      const file = { buffer: Buffer.from('new') } as Express.Multer.File;
      const user = { id: 1n };
      const ip = '127.0.0.1';

      mockPrismaService.birCertification.findUnique.mockResolvedValue(existing);
      mockCloudinaryService.delete.mockResolvedValue(true);
      mockCloudinaryService.uploadWithPublicId.mockResolvedValue({
        imageUrl: 'new_url',
        imagePublicId: 'new_pub_id',
      });
      mockPrismaService.birCertification.update.mockResolvedValue({
        ...existing,
        ...dto,
        imageUrl: 'new_url',
        imagePublicId: 'new_pub_id',
      });

      const result = await service.update('uuid-123', dto, file, user, ip);

      expect(cloudinary.delete).toHaveBeenCalledWith('old_pub_id');
      expect(cloudinary.uploadWithPublicId).toHaveBeenCalledWith(file, 'bir_certifications');
      expect(prisma.birCertification.update).toHaveBeenCalled();
      expect(prisma.user_activities.create).toHaveBeenCalledWith({
        data: {
          user_id: user.id,
          action: 'UPDATE_BIR_CERTIFICATION',
          ip_address: ip,
        },
      });
      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException if updating non-existent record', async () => {
      mockPrismaService.birCertification.findUnique.mockResolvedValue(null);

      await expect(
        service.update('uuid-123', {}, {} as Express.Multer.File, { id: 1n }, '127.0.0.1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete cloudinary asset and run database delete in transaction', async () => {
      const existing = {
        id: 'uuid-123',
        imagePublicId: 'test_pub_id',
      };
      const user = { id: 1n };
      const ip = '127.0.0.1';

      mockPrismaService.birCertification.findUnique.mockResolvedValue(existing);
      mockCloudinaryService.delete.mockResolvedValue(true);
      mockPrismaService.$transaction.mockResolvedValue([{}, {}]);

      const result = await service.remove('uuid-123', user, ip);

      expect(cloudinary.delete).toHaveBeenCalledWith('test_pub_id');
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException if deleting non-existent record', async () => {
      mockPrismaService.birCertification.findUnique.mockResolvedValue(null);

      await expect(service.remove('uuid-123', { id: 1n }, '127.0.0.1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
