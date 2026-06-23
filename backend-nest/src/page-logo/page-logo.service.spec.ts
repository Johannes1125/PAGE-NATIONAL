import { Test, TestingModule } from '@nestjs/testing';
import { PageLogoService } from './page-logo.service';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

const mockLogoRecord = {
  id: 1,
  sequenceNumber: 'PL-001',
  title: 'Official Shield Logo',
  description: 'This is the official PAGE national shield logo containing the founding year 1962.',
  imageUrl: 'https://cloudinary.com/page_logo/pl_001.png',
  imagePublicId: 'about_page/page_logo/pl_001',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockLogoRecords = [
  mockLogoRecord,
  {
    ...mockLogoRecord,
    id: 2,
    sequenceNumber: 'PL-002',
    title: 'Alternate Monochrome Logo',
    description: 'A monochrome black-and-white variant of the official shield mark.',
    imageUrl: 'https://cloudinary.com/page_logo/pl_002.png',
    imagePublicId: 'about_page/page_logo/pl_002',
  },
];

const prismaMock = {
  page_logos: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  user_activities: {
    create: jest.fn(),
  },
};

const cloudinaryMock = {
  uploadWithPublicId: jest.fn(),
  delete: jest.fn(),
};

const mockUser = { id: BigInt(1) };
const mockIp = '127.0.0.1';

const createMockFile = (mimeType = 'image/png', size = 1000): Express.Multer.File => ({
  fieldname: 'image',
  originalname: 'test.png',
  encoding: '7bit',
  mimetype: mimeType,
  buffer: Buffer.from('mock buffer'),
  size,
  destination: '',
  filename: '',
  path: '',
  stream: null as any,
});

describe('PageLogoService', () => {
  let service: PageLogoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PageLogoService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: CloudinaryService, useValue: cloudinaryMock },
      ],
    }).compile();

    service = module.get<PageLogoService>(PageLogoService);
    jest.clearAllMocks();
  });

  // ── findAll ───────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('returns all logos ordered by id ascending', async () => {
      prismaMock.page_logos.findMany.mockResolvedValue(mockLogoRecords);

      const result = await service.findAll();

      expect(prismaMock.page_logos.findMany).toHaveBeenCalledWith({
        orderBy: { id: 'asc' },
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockLogoRecords);
    });
  });

  // ── findOne ───────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('returns a single logo by id', async () => {
      prismaMock.page_logos.findUnique.mockResolvedValue(mockLogoRecord);

      const result = await service.findOne(1);

      expect(prismaMock.page_logos.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockLogoRecord);
    });

    it('throws NotFoundException when logo does not exist', async () => {
      prismaMock.page_logos.findUnique.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  // ── create ────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('creates a logo, uploads image, auto-generates next sequence number, and logs activity', async () => {
      const dto = {
        title: 'New Logo',
        description: 'New PAGE logo variant with high resolution graphics.',
      };
      const mockFile = createMockFile('image/jpeg', 2 * 1024 * 1024);

      // Latest record is PL-002, so next is PL-003
      prismaMock.page_logos.findFirst.mockResolvedValue(mockLogoRecords[1]);
      cloudinaryMock.uploadWithPublicId.mockResolvedValue({
        imageUrl: 'https://cloudinary.com/page_logo/pl_003.jpg',
        imagePublicId: 'about_page/page_logo/pl_003',
      });
      prismaMock.page_logos.create.mockResolvedValue({
        id: 3,
        sequenceNumber: 'PL-003',
        ...dto,
        imageUrl: 'https://cloudinary.com/page_logo/pl_003.jpg',
        imagePublicId: 'about_page/page_logo/pl_003',
      });
      prismaMock.user_activities.create.mockResolvedValue({});

      const result = await service.create(dto, mockFile, mockUser, mockIp);

      expect(prismaMock.page_logos.findFirst).toHaveBeenCalledWith({
        orderBy: { id: 'desc' },
      });
      expect(cloudinaryMock.uploadWithPublicId).toHaveBeenCalledWith(mockFile, 'about_page/page_logo');
      expect(prismaMock.page_logos.create).toHaveBeenCalledWith({
        data: {
          sequenceNumber: 'PL-003',
          title: dto.title,
          description: dto.description,
          imageUrl: 'https://cloudinary.com/page_logo/pl_003.jpg',
          imagePublicId: 'about_page/page_logo/pl_003',
        },
      });
      expect(prismaMock.user_activities.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          user_id: mockUser.id,
          action: 'Created PAGE Logo: New Logo',
          ip_address: mockIp,
        }),
      });
      expect(result.success).toBe(true);
      expect(result.data.sequenceNumber).toBe('PL-003');
    });

    it('defaults to PL-001 sequence number when database is empty', async () => {
      const dto = { title: 'First Logo', description: 'This is description containing at least 20 chars.' };
      const mockFile = createMockFile('image/png', 5000);

      prismaMock.page_logos.findFirst.mockResolvedValue(null);
      cloudinaryMock.uploadWithPublicId.mockResolvedValue({
        imageUrl: 'https://cloudinary.com/page_logo/pl_001.png',
        imagePublicId: 'about_page/page_logo/pl_001',
      });
      prismaMock.page_logos.create.mockResolvedValue({
        id: 1,
        sequenceNumber: 'PL-001',
        ...dto,
        imageUrl: 'https://cloudinary.com/page_logo/pl_001.png',
        imagePublicId: 'about_page/page_logo/pl_001',
      });

      const result = await service.create(dto, mockFile, mockUser, mockIp);

      expect(result.data.sequenceNumber).toBe('PL-001');
    });

    it('throws BadRequestException if image is missing', async () => {
      const dto = { title: 'First Logo', description: 'This is description containing at least 20 chars.' };
      await expect(service.create(dto, null as any, mockUser, mockIp)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException if image format is invalid', async () => {
      const dto = { title: 'First Logo', description: 'This is description containing at least 20 chars.' };
      const invalidFile = createMockFile('image/webp', 5000);

      await expect(service.create(dto, invalidFile, mockUser, mockIp)).rejects.toThrow(
        new BadRequestException('Invalid file type. Only JPG, JPEG, PNG, and SVG are allowed.'),
      );
    });

    it('throws BadRequestException if image size exceeds 5MB', async () => {
      const dto = { title: 'First Logo', description: 'This is description containing at least 20 chars.' };
      const largeFile = createMockFile('image/png', 6 * 1024 * 1024);

      await expect(service.create(dto, largeFile, mockUser, mockIp)).rejects.toThrow(
        new BadRequestException('Image size exceeds the 5MB limit.'),
      );
    });
  });

  // ── update ────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('updates logo textual fields without uploading a new image', async () => {
      const dto = { title: 'Updated Title' };
      const updated = { ...mockLogoRecord, title: 'Updated Title' };

      prismaMock.page_logos.findUnique.mockResolvedValue(mockLogoRecord);
      prismaMock.page_logos.update.mockResolvedValue(updated);
      prismaMock.user_activities.create.mockResolvedValue({});

      const result = await service.update(1, dto, null as any, mockUser, mockIp);

      expect(cloudinaryMock.uploadWithPublicId).not.toHaveBeenCalled();
      expect(prismaMock.page_logos.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({ title: 'Updated Title' }),
      });
      expect(result.success).toBe(true);
      expect(result.data.title).toBe('Updated Title');
    });

    it('replaces image and deletes old asset on Cloudinary if new image is uploaded', async () => {
      const dto = { description: 'This is the newly updated description containing 20+ chars.' };
      const mockFile = createMockFile('image/jpg', 10000);
      const updated = {
        ...mockLogoRecord,
        description: dto.description,
        imageUrl: 'https://cloudinary.com/page_logo/pl_001_new.jpg',
        imagePublicId: 'about_page/page_logo/pl_001_new',
      };

      prismaMock.page_logos.findUnique.mockResolvedValue(mockLogoRecord);
      cloudinaryMock.uploadWithPublicId.mockResolvedValue({
        imageUrl: 'https://cloudinary.com/page_logo/pl_001_new.jpg',
        imagePublicId: 'about_page/page_logo/pl_001_new',
      });
      cloudinaryMock.delete.mockResolvedValue(true);
      prismaMock.page_logos.update.mockResolvedValue(updated);

      const result = await service.update(1, dto, mockFile, mockUser, mockIp);

      expect(cloudinaryMock.uploadWithPublicId).toHaveBeenCalledWith(mockFile, 'about_page/page_logo');
      expect(cloudinaryMock.delete).toHaveBeenCalledWith(mockLogoRecord.imagePublicId);
      expect(result.success).toBe(true);
      expect(result.data.imageUrl).toBe('https://cloudinary.com/page_logo/pl_001_new.jpg');
    });

    it('throws NotFoundException when trying to update non-existent logo', async () => {
      prismaMock.page_logos.findUnique.mockResolvedValue(null);

      await expect(service.update(99, { title: 'X' }, null as any, mockUser, mockIp)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── remove ────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('deletes logo record and removes associated Cloudinary asset', async () => {
      prismaMock.page_logos.findUnique.mockResolvedValue(mockLogoRecord);
      cloudinaryMock.delete.mockResolvedValue(true);
      prismaMock.page_logos.delete.mockResolvedValue(mockLogoRecord);
      prismaMock.user_activities.create.mockResolvedValue({});

      const result = await service.remove(1, mockUser, mockIp);

      expect(cloudinaryMock.delete).toHaveBeenCalledWith(mockLogoRecord.imagePublicId);
      expect(prismaMock.page_logos.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prismaMock.user_activities.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'Deleted PAGE Logo: Official Shield Logo',
        }),
      });
      expect(result.success).toBe(true);
    });

    it('throws NotFoundException when trying to delete non-existent logo', async () => {
      prismaMock.page_logos.findUnique.mockResolvedValue(null);

      await expect(service.remove(99, mockUser, mockIp)).rejects.toThrow(NotFoundException);
    });
  });
});
