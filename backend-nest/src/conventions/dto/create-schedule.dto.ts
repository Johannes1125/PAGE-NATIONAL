import { IsNotEmpty, IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateScheduleDto {
  @IsDateString({}, { message: 'Schedule date must be a valid ISO date string.' })
  @IsNotEmpty({ message: 'Schedule date is required.' })
  schedule_date: string;

  @IsString()
  @IsNotEmpty({ message: 'Title is required.' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Event type is required.' })
  event_type: string;

  @IsString()
  @IsOptional()
  start_time?: string;

  @IsString()
  @IsOptional()
  end_time?: string;

  @IsString()
  @IsNotEmpty({ message: 'Location is required.' })
  location: string;
}
