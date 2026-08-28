import { Test, TestingModule } from '@nestjs/testing';
import { BirCertificationsService } from './bir-certifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { SupabaseService } from '../supabase/supabase.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('BirCertificationsService', () => {
  let service: BirCertificationsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    birCertification: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user_activities: {
      create: jest.fn(),
    },
  };

  const mockCloudinaryService = {
    uploadWithPublicId: jest.fn(),
    delete: jest.fn(),
  };

  const mockSupabaseService = {
    upload: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BirCertificationsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CloudinaryService, useValue: mockCloudinaryService },
        { provide: SupabaseService, useValue: mockSupabaseService },
      ],
    }).compile();

    service = module.get<BirCertificationsService>(BirCertificationsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return non-archived records', async () => {
      const records = [
        { id: '1', status: 'active' },
        { id: '2', status: 'active' },
      ];
      mockPrismaService.birCertification.findMany.mockResolvedValue(records);

      const result = await service.findAll();

      expect(prisma.birCertification.findMany).toHaveBeenCalledWith({
        where: { status: { not: 'archived' } },
        orderBy: { createdAt: 'desc' },
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
      expect(result.success).toBe(true);
      expect(result.data).toEqual(record);
    });

    it('should throw NotFoundException if record not found', async () => {
      mockPrismaService.birCertification.findUnique.mockResolvedValue(null);
      await expect(service.findOne('uuid-123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('archive', () => {
    it('should archive a record and log activity', async () => {
      const existing = { id: 'uuid-123', registrationName: 'Test Reg', status: 'active' };
      mockPrismaService.birCertification.findUnique.mockResolvedValue(existing);
      mockPrismaService.birCertification.update.mockResolvedValue({ ...existing, status: 'archived' });
      mockPrismaService.user_activities.create.mockResolvedValue({});

      const result = await service.archive('uuid-123', { id: 1n }, '127.0.0.1');

      expect(prisma.birCertification.update).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
        data: { status: 'archived' },
      });
      expect(result.success).toBe(true);
      expect(result.data.status).toBe('archived');
    });

    it('should throw ConflictException if already archived', async () => {
      mockPrismaService.birCertification.findUnique.mockResolvedValue({ id: 'uuid-123', status: 'archived' });
      await expect(service.archive('uuid-123', { id: 1n }, '127.0.0.1')).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if record not found', async () => {
      mockPrismaService.birCertification.findUnique.mockResolvedValue(null);
      await expect(service.archive('uuid-123', { id: 1n }, '127.0.0.1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('unarchive', () => {
    it('should unarchive a record and log activity', async () => {
      const existing = { id: 'uuid-123', registrationName: 'Test Reg', status: 'archived' };
      mockPrismaService.birCertification.findUnique.mockResolvedValue(existing);
      mockPrismaService.birCertification.update.mockResolvedValue({ ...existing, status: 'active' });
      mockPrismaService.user_activities.create.mockResolvedValue({});

      const result = await service.unarchive('uuid-123', { id: 1n }, '127.0.0.1');

      expect(prisma.birCertification.update).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
        data: { status: 'active' },
      });
      expect(result.success).toBe(true);
      expect(result.data.status).toBe('active');
    });

    it('should throw ConflictException if not archived', async () => {
      mockPrismaService.birCertification.findUnique.mockResolvedValue({ id: 'uuid-123', status: 'active' });
      await expect(service.unarchive('uuid-123', { id: 1n }, '127.0.0.1')).rejects.toThrow(ConflictException);
    });
  });
});
