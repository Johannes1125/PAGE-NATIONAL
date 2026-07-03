import { IsNotEmpty, IsString, IsIn, IsOptional } from 'class-validator';

export class CreateAttachmentDto {
  @IsString()
  @IsOptional()
  file_url?: string;

  @IsString()
  @IsOptional()
  file_name?: string;

  @IsString()
  @IsOptional()
  @IsIn(['image', 'pdf'], { message: 'File type must be either image or pdf.' })
  file_type?: string;
}
