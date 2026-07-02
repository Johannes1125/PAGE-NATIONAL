import { IsString, IsNotEmpty, IsDateString, IsOptional, IsIn } from 'class-validator';

export class UpdateConventionDto {
  @IsString()
  @IsNotEmpty({ message: 'Convention number must not be empty.' })
  @IsOptional()
  convention_number?: string;

  @IsString()
  @IsNotEmpty({ message: 'Title must not be empty.' })
  @IsOptional()
  title?: string;

  @IsString()
  @IsNotEmpty({ message: 'Location must not be empty.' })
  @IsOptional()
  location?: string;

  @IsDateString({}, { message: 'Convention date must be a valid ISO date string.' })
  @IsNotEmpty({ message: 'Convention date must not be empty.' })
  @IsOptional()
  convention_date?: string;

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
