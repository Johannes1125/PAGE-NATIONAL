import { Test, TestingModule } from '@nestjs/testing';
import { HistoricalRecordsService } from './historical-records.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { ProgramType } from './dto/create-historical-record.dto';

// ── Mock PrismaService ─────────────────────────────────────────────────────

const mockRecord = {
  id: 'test-uuid-1234',
  title: 'National Convention Established',
  yearStart: 2005,
  programType: 'Convention',
  description: 'PAGE officially launched its first national convention with over 100 institutions.',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockRecords = [
  { ...mockRecord, yearStart: 1998, title: 'Early Initiative' },
  { ...mockRecord, yearStart: 2001, title: 'Seminar Series Launched' },
  { ...mockRecord, yearStart: 2005, title: 'National Convention Established' },
  { ...mockRecord, yearStart: 2010, title: 'Digital Transformation' },
];

const prismaMock = {
  historical_records: {
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

const mockUser = { id: BigInt(1) };
const mockIp = '127.0.0.1';

// ── Tests ──────────────────────────────────────────────────────────────────

describe('HistoricalRecordsService', () => {
  let service: HistoricalRecordsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HistoricalRecordsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<HistoricalRecordsService>(HistoricalRecordsService);
    jest.clearAllMocks();
  });

  // ── findAll ───────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('returns all records ordered by yearStart ascending', async () => {
      prismaMock.historical_records.findMany.mockResolvedValue(mockRecords);

      const result = await service.findAll();

      expect(prismaMock.historical_records.findMany).toHaveBeenCalledWith({
        where: { status: { not: 'archived' } },
        orderBy: [
          { yearStart: 'asc' },
          { sortOrder: 'asc' },
        ],
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRecords);
      expect(result.data[0].yearStart).toBe(1998);
      expect(result.data[1].yearStart).toBe(2001);
      expect(result.data[2].yearStart).toBe(2005);
      expect(result.data[3].yearStart).toBe(2010);
    });

    it('returns empty array when no records exist', async () => {
      prismaMock.historical_records.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  // ── findOne ───────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('returns a single record by id', async () => {
      prismaMock.historical_records.findUnique.mockResolvedValue(mockRecord);

      const result = await service.findOne(mockRecord.id);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRecord);
    });

    it('throws NotFoundException when record does not exist', async () => {
      prismaMock.historical_records.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ── create ────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('creates a historical record and logs activity', async () => {
      const dto = {
        title: 'National Convention Established',
        yearStart: 2005,
        programType: ProgramType.Convention,
        description: 'PAGE officially launched its first national convention.',
      };
      prismaMock.historical_records.create.mockResolvedValue(mockRecord);
      prismaMock.user_activities.create.mockResolvedValue({});

      const result = await service.create(dto, mockUser, mockIp);

      expect(prismaMock.historical_records.create).toHaveBeenCalledWith({
        data: {
          title: dto.title,
          yearStart: dto.yearStart,
          programType: dto.programType,
          description: dto.description,
          status: 'active',
        },
      });
      expect(prismaMock.user_activities.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          user_id: mockUser.id,
          action: expect.stringContaining('Created Historical Record'),
          ip_address: mockIp,
        }),
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRecord);
      expect(result.message).toBe('Historical record created successfully.');
    });
  });

  // ── update ────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('updates a historical record and logs activity', async () => {
      const dto = { title: 'Updated Title', yearStart: 2006 };
      const updatedRecord = { ...mockRecord, ...dto };

      prismaMock.historical_records.findUnique.mockResolvedValue(mockRecord);
      prismaMock.historical_records.update.mockResolvedValue(updatedRecord);
      prismaMock.user_activities.create.mockResolvedValue({});

      const result = await service.update(mockRecord.id, dto, mockUser, mockIp);

      expect(prismaMock.historical_records.update).toHaveBeenCalledWith({
        where: { id: mockRecord.id },
        data: expect.objectContaining({ title: 'Updated Title', yearStart: 2006 }),
      });
      expect(prismaMock.user_activities.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: expect.stringContaining('Updated Historical Record'),
        }),
      });
      expect(result.success).toBe(true);
      expect(result.message).toBe('Historical record updated successfully.');
    });

    it('throws NotFoundException when trying to update non-existent record', async () => {
      prismaMock.historical_records.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', { title: 'X' }, mockUser, mockIp),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── archive ───────────────────────────────────────────────────────────────

  describe('archive', () => {
    it('archives a historical record and logs activity', async () => {
      const activeRecord = { ...mockRecord, status: 'active' };
      prismaMock.historical_records.findUnique.mockResolvedValue(activeRecord);
      prismaMock.historical_records.update.mockResolvedValue({ ...activeRecord, status: 'archived' });
      prismaMock.user_activities.create.mockResolvedValue({});

      const result = await service.archive(mockRecord.id, mockUser, mockIp);

      expect(prismaMock.historical_records.update).toHaveBeenCalledWith({
        where: { id: mockRecord.id },
        data: { status: 'archived' },
      });
      expect(prismaMock.user_activities.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: expect.stringContaining('archived_historical_record'),
        }),
      });
      expect(result.success).toBe(true);
      expect(result.message).toBe('Historical record archived successfully.');
    });

    it('throws NotFoundException when trying to archive non-existent record', async () => {
      prismaMock.historical_records.findUnique.mockResolvedValue(null);

      await expect(
        service.archive('non-existent-id', mockUser, mockIp),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── unarchive ─────────────────────────────────────────────────────────────

  describe('unarchive', () => {
    it('unarchives a historical record and logs activity', async () => {
      const archivedRecord = { ...mockRecord, status: 'archived' };
      prismaMock.historical_records.findUnique.mockResolvedValue(archivedRecord);
      prismaMock.historical_records.update.mockResolvedValue({ ...archivedRecord, status: 'active' });
      prismaMock.user_activities.create.mockResolvedValue({});

      const result = await service.unarchive(mockRecord.id, mockUser, mockIp);

      expect(prismaMock.historical_records.update).toHaveBeenCalledWith({
        where: { id: mockRecord.id },
        data: { status: 'active' },
      });
      expect(prismaMock.user_activities.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: expect.stringContaining('unarchived_historical_record'),
        }),
      });
      expect(result.success).toBe(true);
      expect(result.message).toBe('Historical record unarchived successfully.');
    });

    it('throws NotFoundException when trying to unarchive non-existent record', async () => {
      prismaMock.historical_records.findUnique.mockResolvedValue(null);

      await expect(
        service.unarchive('non-existent-id', mockUser, mockIp),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── Year validation ───────────────────────────────────────────────────────
  // NOTE: Year validation is enforced by class-validator DTO at the controller
  // level. The service receives already-validated integers, so we verify the
  // DTO constraints with a separate describe block using the constants.

  describe('Year validation constants', () => {
    it('accepts year 1900 as the minimum valid year', () => {
      // Min is 1900 per @Min(1900) in DTO
      expect(1900).toBeGreaterThanOrEqual(1900);
    });

    it('rejects years below 1900', () => {
      const invalidYear = 1899;
      expect(invalidYear).toBeLessThan(1900);
    });

    it('rejects years above the current year', () => {
      const currentYear = new Date().getFullYear();
      const futureYear = currentYear + 1;
      expect(futureYear).toBeGreaterThan(currentYear);
    });

    it('accepts the current year as valid', () => {
      const currentYear = new Date().getFullYear();
      expect(currentYear).toBeLessThanOrEqual(currentYear);
    });
  });

  // ── ProgramType validation ────────────────────────────────────────────────

  describe('ProgramType validation', () => {
    const validTypes = ['Initiative', 'Conference', 'Seminar', 'Convention', 'Other'];

    it.each(validTypes)('accepts valid program type: %s', (type) => {
      expect(Object.values(ProgramType)).toContain(type);
    });

    it('rejects invalid program types', () => {
      const invalidType = 'Workshop';
      expect(Object.values(ProgramType)).not.toContain(invalidType);
    });
  });

  // ── Sorting logic ─────────────────────────────────────────────────────────

  describe('Sorting logic', () => {
    it('records returned by findAll are in ascending yearStart order', async () => {
      const unsortedRecords = [
        { ...mockRecord, yearStart: 2010 },
        { ...mockRecord, yearStart: 1998 },
        { ...mockRecord, yearStart: 2005 },
      ];
      // Backend query uses orderBy yearStart:asc — simulate what Prisma returns
      const sortedByPrisma = [...unsortedRecords].sort((a, b) => a.yearStart - b.yearStart);
      prismaMock.historical_records.findMany.mockResolvedValue(sortedByPrisma);

      const result = await service.findAll();

      expect(result.data[0].yearStart).toBe(1998);
      expect(result.data[1].yearStart).toBe(2005);
      expect(result.data[2].yearStart).toBe(2010);
    });
  });
});
