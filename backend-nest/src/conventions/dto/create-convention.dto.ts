import { IsNotEmpty, IsString, IsDateString, IsOptional, IsIn } from 'class-validator';

export class CreateConventionDto {
  @IsString()
  @IsNotEmpty({ message: 'Convention number is required.' })
  convention_number: string;

  @IsString()
  @IsNotEmpty({ message: 'Title is required.' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Location is required.' })
  location: string;

  @IsDateString({}, { message: 'Convention date must be a valid ISO date string.' })
  @IsNotEmpty({ message: 'Convention date is required.' })
  convention_date: string;

  @IsString()
  @IsOptional()
  @IsIn(['draft', 'published'], { message: 'Status must be either draft or published.' })
  status?: string;

  @IsString()
  @IsOptional()
  banner_url?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
