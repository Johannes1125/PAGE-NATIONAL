import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class UpdatePageLogoDto {
  @IsOptional()
  @IsString({ message: 'Title must be a string.' })
  @MinLength(3, { message: 'Title must be at least 3 characters long.' })
  @MaxLength(255, { message: 'Title cannot exceed 255 characters.' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string.' })
  @MinLength(20, { message: 'Description must be at least 20 characters long.' })
  description?: string;
}
