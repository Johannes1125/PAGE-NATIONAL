import { IsString, IsNotEmpty, IsInt, IsEnum, MinLength, MaxLength, Min, Max, IsOptional } from 'class-validator';
import { ProgramType } from './create-historical-record.dto';

export class UpdateHistoricalRecordDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required when provided.' })
  @MaxLength(255, { message: 'Title must not exceed 255 characters.' })
  @IsOptional()
  title?: string;

  @IsInt({ message: 'Year Start must be a whole number.' })
  @Min(1900, { message: 'Year Start must be 1900 or later.' })
  @Max(new Date().getFullYear(), {
    message: `Year Start must not exceed the current year (${new Date().getFullYear()}).`,
  })
  @IsOptional()
  yearStart?: number;

  @IsEnum(ProgramType, {
    message: 'Program Type must be one of: Initiative, Conference, Seminar, Convention, Other.',
  })
  @IsOptional()
  programType?: ProgramType;

  @IsString()
  @IsNotEmpty({ message: 'Description is required when provided.' })
  @MinLength(10, { message: 'Description must be at least 10 characters.' })
  @IsOptional()
  description?: string;
}

