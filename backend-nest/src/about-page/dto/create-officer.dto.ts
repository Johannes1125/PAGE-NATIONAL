import { IsString, IsNotEmpty, IsEnum, IsOptional, IsInt } from 'class-validator';

export class CreateOfficerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  position: string;

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
