import { IsString, IsEnum, IsOptional } from 'class-validator';

export class UpdateSectionDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsEnum(['draft', 'published', 'archived'])
  @IsOptional()
  status?: string;
}
