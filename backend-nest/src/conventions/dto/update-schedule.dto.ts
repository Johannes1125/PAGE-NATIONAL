import { IsNotEmpty, IsString, IsDateString, IsOptional } from 'class-validator';

export class UpdateScheduleDto {
  @IsDateString({}, { message: 'Schedule date must be a valid ISO date string.' })
  @IsNotEmpty({ message: 'Schedule date must not be empty.' })
  @IsOptional()
  schedule_date?: string;

  @IsString()
  @IsNotEmpty({ message: 'Title must not be empty.' })
  @IsOptional()
  title?: string;

  @IsString()
  @IsNotEmpty({ message: 'Event type must not be empty.' })
  @IsOptional()
  event_type?: string;

  @IsString()
  @IsOptional()
  start_time?: string;

  @IsString()
  @IsOptional()
  end_time?: string;

  @IsString()
  @IsNotEmpty({ message: 'Location must not be empty.' })
  @IsOptional()
  location?: string;
}
