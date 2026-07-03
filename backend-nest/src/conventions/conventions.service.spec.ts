import { Test, TestingModule } from '@nestjs/testing';
import { ConventionsService } from './conventions.service';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { SupabaseService } from '../supabase/supabase.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

const mockConventionRecord = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  convention_number: '56th Convention',
  title: 'Annual Research & Graduate Convention',
  description: 'Annual gathering of graduate school administrators.',
  location: 'Manila Hotel',
  start_date: new Date('2026-10-15'),
  end_date: new Date('2026-10-17'),
  status: 'draft',
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

const mockSchedule = {
  id: '660e8400-e29b-41d4-a716-446655440000',
  convention_id: mockConventionRecord.id,
  schedule_date: new Date('2026-10-16'),
  title: 'Opening Plenary',
  event_type: 'Plenary',
  start_time: '09:00',
  end_time: '12:00',
  location: 'Main Hall',
  created_at: new Date(),
  updated_at: new Date(),
};

const mockSpeaker = {
  id: '770e8400-e29b-41d4-a716-446655440000',
  convention_id: mockConventionRecord.id,
  name: 'Dr. Jane Doe',
  role_position: 'Keynote Speaker',
  institution: 'University of Example',
  presentation_topic: 'Future of Graduate Education',
  created_at: new Date(),
  updated_at: new Date(),
};

const mockAttachment = {
  id: '880e8400-e29b-41d4-a716-446655440000',
  convention_id: mockConventionRecord.id,
  file_url: 'https://res.cloudinary.com/dzk9kooc8/image/upload/v12345/conventions/banner.jpg',
  file_name: 'banner.jpg',
  file_type: 'image',
  created_at: new Date(),
};

const prismaMock = {
  convention: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  conventionSchedule: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  conventionSpeaker: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  conventionAttachment: {
    findFirst: jest.fn(),
    create: jest.fn(),
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

const supabaseMock = {
  upload: jest.fn(),
};

const mockUser = { id: BigInt(1) };
const mockIp = '127.0.0.1';

const createMockFile = (mimeType = 'image/png', size = 1000): Express.Multer.File => ({
  fieldname: 'file',
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
        { provide: SupabaseService, useValue: supabaseMock },
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
    });
  });

  describe('findOne', () => {
    it('returns a single convention by ID', async () => {
      prismaMock.convention.findUnique.mockResolvedValue(mockConventionRecord);

      const result = await service.findOne(mockConventionRecord.id);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockConventionRecord);
    });

    it('throws NotFoundException if convention is not found', async () => {
      prismaMock.convention.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findFull', () => {
    it('returns convention with nested relations', async () => {
      const fullRecord = {
        ...mockConventionRecord,
        schedules: [mockSchedule],
        speakers: [mockSpeaker],
        attachments: [mockAttachment],
      };
      prismaMock.convention.findUnique.mockResolvedValue(fullRecord);

      const result = await service.findFull(mockConventionRecord.id);

      expect(prismaMock.convention.findUnique).toHaveBeenCalledWith({
        where: { id: mockConventionRecord.id },
        include: {
          schedules: { orderBy: [{ schedule_date: 'asc' }, { start_time: 'asc' }] },
          speakers: { orderBy: { created_at: 'asc' } },
          attachments: { orderBy: { created_at: 'asc' } },
        },
      });
      expect(result.success).toBe(true);
      expect(result.data.schedules).toHaveLength(1);
      expect(result.data.speakers).toHaveLength(1);
      expect(result.data.attachments).toHaveLength(1);
    });
  });

  describe('create', () => {
    const baseDto = {
      convention_number: '56th Convention',
      title: 'Research Meet',
      description: 'A short description.',
      location: 'Quezon City',
      start_date: '2026-10-15',
      end_date: '2026-10-17',
    };

    it('creates a convention with standard fields', async () => {
      prismaMock.convention.create.mockResolvedValue({
        ...mockConventionRecord,
        attachments: [],
      });

      const result = await service.create(baseDto, mockUser, mockIp);

      expect(prismaMock.convention.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          convention_number: baseDto.convention_number,
          title: baseDto.title,
          description: baseDto.description,
          location: baseDto.location,
          start_date: new Date(baseDto.start_date),
          end_date: new Date(baseDto.end_date),
          status: 'draft',
        }),
        include: { attachments: true },
      });
      expect(prismaMock.user_activities.create).toHaveBeenCalledWith({
        data: { user_id: mockUser.id, action: 'convention_created', ip_address: mockIp },
      });
      expect(result.success).toBe(true);
    });

    it('creates a convention with attachments', async () => {
      const dto = {
        ...baseDto,
        attachments: [
          { file_url: 'https://example.com/a.jpg', file_name: 'a.jpg', file_type: 'image' },
        ],
      };
      prismaMock.convention.create.mockResolvedValue({
        ...mockConventionRecord,
        attachments: [mockAttachment],
      });

      await service.create(dto, mockUser, mockIp);

      expect(prismaMock.convention.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            attachments: {
              create: [{ file_url: 'https://example.com/a.jpg', file_name: 'a.jpg', file_type: 'image' }],
            },
          }),
        }),
      );
    });

    it('throws BadRequestException when end_date is before start_date', async () => {
      const dto = { ...baseDto, start_date: '2026-10-17', end_date: '2026-10-15' };

      await expect(service.create(dto, mockUser, mockIp)).rejects.toThrow(BadRequestException);
    });
  });

  describe('addSchedule', () => {
    const scheduleDto = {
      schedule_date: '2026-10-16',
      title: 'Opening Plenary',
      event_type: 'Plenary',
      start_time: '09:00',
      end_time: '12:00',
      location: 'Main Hall',
    };

    it('adds a schedule within the convention date range', async () => {
      prismaMock.convention.findUnique.mockResolvedValue(mockConventionRecord);
      prismaMock.conventionSchedule.create.mockResolvedValue(mockSchedule);

      const result = await service.addSchedule(mockConventionRecord.id, scheduleDto, mockUser, mockIp);

      expect(result.success).toBe(true);
      expect(prismaMock.user_activities.create).toHaveBeenCalledWith({
        data: { user_id: mockUser.id, action: 'convention_schedule_added', ip_address: mockIp },
      });
    });

    it('rejects schedule dates outside the convention range', async () => {
      prismaMock.convention.findUnique.mockResolvedValue(mockConventionRecord);

      await expect(
        service.addSchedule(
          mockConventionRecord.id,
          { ...scheduleDto, schedule_date: '2026-10-20' },
          mockUser,
          mockIp,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateSchedule', () => {
    it('rejects updated schedule dates outside the convention range', async () => {
      prismaMock.convention.findUnique.mockResolvedValue(mockConventionRecord);
      prismaMock.conventionSchedule.findFirst.mockResolvedValue(mockSchedule);

      await expect(
        service.updateSchedule(
          mockConventionRecord.id,
          mockSchedule.id,
          { schedule_date: '2026-10-20' },
          mockUser,
          mockIp,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('addSpeaker', () => {
    const speakerDto = {
      name: 'Dr. Jane Doe',
      role_position: 'Keynote Speaker',
      institution: 'University of Example',
      presentation_topic: 'Future of Graduate Education',
    };

    it('adds a speaker to a convention', async () => {
      prismaMock.convention.findUnique.mockResolvedValue(mockConventionRecord);
      prismaMock.conventionSpeaker.create.mockResolvedValue(mockSpeaker);

      const result = await service.addSpeaker(mockConventionRecord.id, speakerDto, mockUser, mockIp);

      expect(result.success).toBe(true);
      expect(prismaMock.user_activities.create).toHaveBeenCalledWith({
        data: { user_id: mockUser.id, action: 'convention_speaker_added', ip_address: mockIp },
      });
    });
  });

  describe('addAttachment', () => {
    it('uploads an image attachment via Cloudinary', async () => {
      prismaMock.convention.findUnique.mockResolvedValue(mockConventionRecord);
      const file = createMockFile();
      cloudinaryMock.upload.mockResolvedValue('https://res.cloudinary.com/test/image.jpg');
      prismaMock.conventionAttachment.create.mockResolvedValue(mockAttachment);

      const result = await service.addAttachment(mockConventionRecord.id, file, mockUser, mockIp);

      expect(cloudinaryMock.upload).toHaveBeenCalledWith(file, 'conventions');
      expect(result.success).toBe(true);
    });

    it('uploads a PDF attachment via Supabase', async () => {
      prismaMock.convention.findUnique.mockResolvedValue(mockConventionRecord);
      const file = createMockFile('application/pdf');
      supabaseMock.upload.mockResolvedValue('https://supabase.example.com/doc.pdf');
      prismaMock.conventionAttachment.create.mockResolvedValue({
        ...mockAttachment,
        file_type: 'pdf',
      });

      await service.addAttachment(mockConventionRecord.id, file, mockUser, mockIp);

      expect(supabaseMock.upload).toHaveBeenCalledWith(file, 'governance', 'conventions');
    });
  });

  describe('publish', () => {
    it('sets status to published and logs convention_published', async () => {
      prismaMock.convention.findUnique.mockResolvedValue(mockConventionRecord);
      prismaMock.convention.update.mockResolvedValue({
        ...mockConventionRecord,
        status: 'published',
        published_at: new Date(),
      });

      const result = await service.publish(mockConventionRecord.id, mockUser, mockIp);

      expect(result.success).toBe(true);
      expect(prismaMock.user_activities.create).toHaveBeenCalledWith({
        data: { user_id: mockUser.id, action: 'convention_published', ip_address: mockIp },
      });
    });
  });

  describe('remove', () => {
    it('deletes convention and cleans up image attachments from Cloudinary', async () => {
      prismaMock.convention.findUnique.mockResolvedValue({
        ...mockConventionRecord,
        attachments: [mockAttachment],
      });
      prismaMock.convention.delete.mockResolvedValue(mockConventionRecord);

      const result = await service.remove(mockConventionRecord.id, mockUser, mockIp);

      expect(prismaMock.convention.delete).toHaveBeenCalledWith({
        where: { id: mockConventionRecord.id },
      });
      expect(cloudinaryMock.delete).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });
});
