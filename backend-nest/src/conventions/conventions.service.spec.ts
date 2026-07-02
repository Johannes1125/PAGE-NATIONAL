import { Test, TestingModule } from '@nestjs/testing';
import { ConventionsService } from './conventions.service';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

const mockConventionRecord = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  convention_number: '56th Convention',
  title: 'Annual Research & Graduate Convention',
  location: 'Manila Hotel',
  convention_date: new Date('2026-10-15'),
  status: 'draft',
  banner_url: 'https://res.cloudinary.com/dzk9kooc8/image/upload/v12345/conventions/test.jpg',
  description: 'Annual gathering of graduate school administrators.',
  created_by: BigInt(1),
  updated_by: BigInt(1),
  created_at: new Date(),
  updated_at: new Date(),
  published_at: null,
};

const mockConventionRecords = [
  mockConventionRecord,
  {
    ...mockConventionRecord,
    id: '550e8400-e29b-41d4-a716-446655440001',
    status: 'published',
    published_at: new Date(),
  },
];

const prismaMock = {
  convention: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  user_activities: {
    create: jest.fn(),
  },
};

const cloudinaryMock = {
  upload: jest.fn(),
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
  //@ts-ignore
  headers: {},
});

describe('ConventionsService', () => {
  let service: ConventionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConventionsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: CloudinaryService, useValue: cloudinaryMock },
      ],
    }).compile();

    service = module.get<ConventionsService>(ConventionsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns all conventions when no status filter is applied', async () => {
      prismaMock.convention.findMany.mockResolvedValue(mockConventionRecords);

      const result = await service.findAll();

      expect(prismaMock.convention.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { created_at: 'desc' },
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockConventionRecords);
    });

    it('filters conventions by status', async () => {
      prismaMock.convention.findMany.mockResolvedValue([mockConventionRecords[1]]);

      const result = await service.findAll('published');

      expect(prismaMock.convention.findMany).toHaveBeenCalledWith({
        where: { status: 'published' },
        orderBy: { created_at: 'desc' },
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockConventionRecords[1]]);
    });
  });

  describe('findOne', () => {
    it('returns a single convention by ID', async () => {
      prismaMock.convention.findUnique.mockResolvedValue(mockConventionRecord);

      const result = await service.findOne(mockConventionRecord.id);

      expect(prismaMock.convention.findUnique).toHaveBeenCalledWith({
        where: { id: mockConventionRecord.id },
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockConventionRecord);
    });

    it('throws NotFoundException if convention is not found', async () => {
      prismaMock.convention.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates a convention with standard fields', async () => {
      const dto = {
        convention_number: '56th Convention',
        title: 'Research Meet',
        location: 'Quezon City',
        convention_date: '2026-10-15',
      };
      prismaMock.convention.create.mockResolvedValue({
        ...mockConventionRecord,
        ...dto,
        status: 'draft',
      });

      const result = await service.create(dto, null, mockUser, mockIp);

      expect(prismaMock.convention.create).toHaveBeenCalledWith({
        data: {
          convention_number: dto.convention_number,
          title: dto.title,
          location: dto.location,
          convention_date: new Date(dto.convention_date),
          status: 'draft',
          banner_url: null,
          description: null,
          created_by: mockUser.id,
          updated_by: mockUser.id,
          published_at: null,
        },
      });
      expect(prismaMock.user_activities.create).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('creates a convention with a banner image', async () => {
      const dto = {
        convention_number: '56th Convention',
        title: 'Research Meet',
        location: 'Quezon City',
        convention_date: '2026-10-15',
      };
      const file = createMockFile();
      const uploadedUrl = 'https://res.cloudinary.com/test-image.jpg';
      cloudinaryMock.upload.mockResolvedValue(uploadedUrl);
      prismaMock.convention.create.mockResolvedValue({
        ...mockConventionRecord,
        ...dto,
        banner_url: uploadedUrl,
      });

      const result = await service.create(dto, file, mockUser, mockIp);

      expect(cloudinaryMock.upload).toHaveBeenCalledWith(file, 'conventions');
      expect(prismaMock.convention.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          banner_url: uploadedUrl,
        }),
      }));
      expect(result.success).toBe(true);
    });

    it('sets published_at if status is published', async () => {
      const dto = {
        convention_number: '56th Convention',
        title: 'Research Meet',
        location: 'Quezon City',
        convention_date: '2026-10-15',
        status: 'published',
      };
      prismaMock.convention.create.mockResolvedValue({
        ...mockConventionRecord,
        status: 'published',
        published_at: new Date(),
      });

      await service.create(dto, null, mockUser, mockIp);

      expect(prismaMock.convention.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          status: 'published',
          published_at: expect.any(Date),
        }),
      }));
    });

    it('throws BadRequestException if image upload fails', async () => {
      const dto = {
        convention_number: '56th Convention',
        title: 'Research Meet',
        location: 'Quezon City',
        convention_date: '2026-10-15',
      };
      const file = createMockFile();
      cloudinaryMock.upload.mockResolvedValue(null);

      await expect(service.create(dto, file, mockUser, mockIp)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException for invalid file mimetype', async () => {
      const dto = {
        convention_number: '56th Convention',
        title: 'Research Meet',
        location: 'Quezon City',
        convention_date: '2026-10-15',
      };
      const file = createMockFile('application/pdf');

      await expect(service.create(dto, file, mockUser, mockIp)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('updates text fields successfully', async () => {
      const existing = { ...mockConventionRecord };
      prismaMock.convention.findUnique.mockResolvedValue(existing);
      const dto = { title: 'New Convention Title' };
      prismaMock.convention.update.mockResolvedValue({
        ...existing,
        title: dto.title,
      });

      const result = await service.update(existing.id, dto, null, mockUser, mockIp);

      expect(prismaMock.convention.update).toHaveBeenCalledWith({
        where: { id: existing.id },
        data: expect.objectContaining({
          title: dto.title,
          updated_by: mockUser.id,
        }),
      });
      expect(result.success).toBe(true);
    });

    it('updates and replaces banner image, deleting the old one', async () => {
      const existing = { ...mockConventionRecord };
      prismaMock.convention.findUnique.mockResolvedValue(existing);
      const file = createMockFile();
      const newUrl = 'https://res.cloudinary.com/dzk9kooc8/image/upload/v67890/conventions/new.jpg';
      cloudinaryMock.upload.mockResolvedValue(newUrl);
      prismaMock.convention.update.mockResolvedValue({
        ...existing,
        banner_url: newUrl,
      });

      const result = await service.update(existing.id, {}, file, mockUser, mockIp);

      expect(cloudinaryMock.upload).toHaveBeenCalledWith(file, 'conventions');
      expect(cloudinaryMock.delete).toHaveBeenCalledWith('conventions/test');
      expect(prismaMock.convention.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          banner_url: newUrl,
        }),
      }));
      expect(result.success).toBe(true);
    });

    it('sets published_at when status is updated to published', async () => {
      const existing = { ...mockConventionRecord, status: 'draft', published_at: null };
      prismaMock.convention.findUnique.mockResolvedValue(existing);
      prismaMock.convention.update.mockResolvedValue({
        ...existing,
        status: 'published',
        published_at: new Date(),
      });

      await service.update(existing.id, { status: 'published' }, null, mockUser, mockIp);

      expect(prismaMock.convention.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          status: 'published',
          published_at: expect.any(Date),
        }),
      }));
    });

    it('clears published_at when status is updated to draft', async () => {
      const existing = { ...mockConventionRecord, status: 'published', published_at: new Date() };
      prismaMock.convention.findUnique.mockResolvedValue(existing);
      prismaMock.convention.update.mockResolvedValue({
        ...existing,
        status: 'draft',
        published_at: null,
      });

      await service.update(existing.id, { status: 'draft' }, null, mockUser, mockIp);

      expect(prismaMock.convention.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          status: 'draft',
          published_at: null,
        }),
      }));
    });
  });

  describe('publish', () => {
    it('sets status to published and published_at to now', async () => {
      prismaMock.convention.findUnique.mockResolvedValue(mockConventionRecord);
      prismaMock.convention.update.mockResolvedValue({
        ...mockConventionRecord,
        status: 'published',
        published_at: new Date(),
      });

      const result = await service.publish(mockConventionRecord.id, mockUser, mockIp);

      expect(prismaMock.convention.update).toHaveBeenCalledWith({
        where: { id: mockConventionRecord.id },
        data: {
          status: 'published',
          published_at: expect.any(Date),
          updated_by: mockUser.id,
        },
      });
      expect(result.success).toBe(true);
    });
  });

  describe('unpublish', () => {
    it('sets status to draft and clears published_at', async () => {
      const publishedRecord = { ...mockConventionRecord, status: 'published', published_at: new Date() };
      prismaMock.convention.findUnique.mockResolvedValue(publishedRecord);
      prismaMock.convention.update.mockResolvedValue({
        ...publishedRecord,
        status: 'draft',
        published_at: null,
      });

      const result = await service.unpublish(mockConventionRecord.id, mockUser, mockIp);

      expect(prismaMock.convention.update).toHaveBeenCalledWith({
        where: { id: mockConventionRecord.id },
        data: {
          status: 'draft',
          published_at: null,
          updated_by: mockUser.id,
        },
      });
      expect(result.success).toBe(true);
    });
  });

  describe('remove', () => {
    it('deletes convention and removes the banner from Cloudinary', async () => {
      prismaMock.convention.findUnique.mockResolvedValue(mockConventionRecord);
      prismaMock.convention.delete.mockResolvedValue(mockConventionRecord);

      const result = await service.remove(mockConventionRecord.id, mockUser, mockIp);

      expect(prismaMock.convention.delete).toHaveBeenCalledWith({
        where: { id: mockConventionRecord.id },
      });
      expect(cloudinaryMock.delete).toHaveBeenCalledWith('conventions/test');
      expect(result.success).toBe(true);
    });
  });
});
