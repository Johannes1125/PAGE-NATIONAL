import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  IsInt,
  Min,
  IsDateString,
  IsUrl,
  ArrayMinSize,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

// ── Nested DTOs ───────────────────────────────────────────────────────────────

export class ChapterImageDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  file_url: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  file_name: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sort_order?: number;
}

export class ChapterDocumentDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  file_url: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  file_name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  file_type: string;
}

export class ChapterOfficerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  category_type: string;

  @IsInt()
  @Min(1900)
  year_joined: number;

  @IsOptional()
  @IsInt()
  @Min(1900)
  year_end?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  sort_order?: number;

  @IsOptional()
  @IsString()
  image_url?: string;
}

export class ChapterActivityDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  image_url?: string;
}

export class ChapterAnnouncementDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsDateString()
  date: string;
}

// ── Main Create DTO ───────────────────────────────────────────────────────────

export class CreateChapterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  short_description: string;

  @IsString()
  @IsNotEmpty()
  island_group: string; // Luzon | Visayas | Mindanao — validated in service

  @IsString()
  @IsNotEmpty()
  region: string; // validated against REGIONS_MAP in service

  @IsString()
  @IsNotEmpty()
  overview: string;

  @IsOptional()
  @IsString()
  mission?: string;

  @IsOptional()
  @IsString()
  vision?: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'At least one image is required.' })
  @ValidateNested({ each: true })
  @Type(() => ChapterImageDto)
  images: ChapterImageDto[];

  @IsArray()
  @ArrayMinSize(1, { message: 'At least one document is required.' })
  @ValidateNested({ each: true })
  @Type(() => ChapterDocumentDto)
  documents: ChapterDocumentDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChapterOfficerDto)
  officers: ChapterOfficerDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChapterActivityDto)
  activities?: ChapterActivityDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChapterAnnouncementDto)
  announcements?: ChapterAnnouncementDto[];
}
