import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  IsIn,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAttachmentDto } from './create-attachment.dto';

export class CreateConventionDto {
  @IsString()
  @IsNotEmpty({ message: 'Convention number is required.' })
  convention_number: string;

  @IsString()
  @IsNotEmpty({ message: 'Title is required.' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required.' })
  description: string;

  @IsString()
  @IsNotEmpty({ message: 'Location is required.' })
  location: string;

  @IsDateString({}, { message: 'Start date must be a valid ISO date string.' })
  @IsNotEmpty({ message: 'Start date is required.' })
  start_date: string;

  @IsDateString({}, { message: 'End date must be a valid ISO date string.' })
  @IsNotEmpty({ message: 'End date is required.' })
  end_date: string;

  @IsString()
  @IsOptional()
  @IsIn(['draft', 'published'], { message: 'Status must be either draft or published.' })
  status?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateAttachmentDto)
  attachments?: CreateAttachmentDto[];
}
