import { IsString, IsNotEmpty, IsInt, IsOptional, IsBoolean } from 'class-validator';

export class UpdateGovernanceDocumentDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  general_description?: string;

  @IsString()
  @IsOptional()
  file_name?: string;

  @IsString()
  @IsOptional()
  file_url?: string;

  @IsInt()
  @IsOptional()
  file_size?: number;

  @IsString()
  @IsOptional()
  uploaded_by?: string;

  @IsOptional()
  removeFile?: boolean | string;
}
