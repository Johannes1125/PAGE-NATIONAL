import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class CreatePageLogoDto {
  @IsNotEmpty({ message: 'Title is required.' })
  @IsString({ message: 'Title must be a string.' })
  @MinLength(3, { message: 'Title must be at least 3 characters long.' })
  @MaxLength(255, { message: 'Title cannot exceed 255 characters.' })
  title: string;

  @IsNotEmpty({ message: 'Description is required.' })
  @IsString({ message: 'Description must be a string.' })
  @MinLength(20, { message: 'Description must be at least 20 characters long.' })
  description: string;
}
