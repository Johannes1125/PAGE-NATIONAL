import { IsString, IsEnum, IsOptional, IsInt } from 'class-validator';

export class UpdateOfficerDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsString()
  @IsOptional()
  chapter?: string;

  @IsString()
  @IsOptional()
  photo_url?: string;

  @IsString()
  @IsOptional()
  term_start?: string;

  @IsString()
  @IsOptional()
  term_end?: string;

  @IsString()
  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: string;

  @IsInt()
  @IsOptional()
  sort_order?: number;
}
