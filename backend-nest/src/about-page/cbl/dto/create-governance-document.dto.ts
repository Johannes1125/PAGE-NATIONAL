import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';

export class CreateGovernanceDocumentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  general_description: string;

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
}
