import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export class CreateSectionDto {
  @IsString()
  @IsNotEmpty()
  section_key: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsEnum(['draft', 'published', 'archived'])
  @IsOptional()
  status?: string;
}
