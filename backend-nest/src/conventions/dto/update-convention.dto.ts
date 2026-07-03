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
  @IsNotEmpty({ message: 'Description must not be empty.' })
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty({ message: 'Location must not be empty.' })
  @IsOptional()
  location?: string;

  @IsDateString({}, { message: 'Start date must be a valid ISO date string.' })
  @IsNotEmpty({ message: 'Start date must not be empty.' })
  @IsOptional()
  start_date?: string;

  @IsDateString({}, { message: 'End date must be a valid ISO date string.' })
  @IsNotEmpty({ message: 'End date must not be empty.' })
  @IsOptional()
  end_date?: string;

  @IsString()
  @IsOptional()
  @IsIn(['draft', 'published'], { message: 'Status must be either draft or published.' })
  status?: string;
}
