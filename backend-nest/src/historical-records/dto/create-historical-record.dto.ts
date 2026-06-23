import { IsString, IsNotEmpty, IsInt, IsEnum, MinLength, MaxLength, Min, Max } from 'class-validator';

export enum ProgramType {
  Initiative = 'Initiative',
  Conference = 'Conference',
  Seminar = 'Seminar',
  Convention = 'Convention',
  Other = 'Other',
}

export class CreateHistoricalRecordDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required.' })
  @MaxLength(255, { message: 'Title must not exceed 255 characters.' })
  title: string;

  @IsInt({ message: 'Year Start must be a whole number.' })
  @Min(1900, { message: 'Year Start must be 1900 or later.' })
  @Max(new Date().getFullYear(), {
    message: `Year Start must not exceed the current year (${new Date().getFullYear()}).`,
  })
  yearStart: number;

  @IsEnum(ProgramType, {
    message: 'Program Type must be one of: Initiative, Conference, Seminar, Convention, Other.',
  })
  programType: ProgramType;

  @IsString()
  @IsNotEmpty({ message: 'Description is required.' })
  @MinLength(10, { message: 'Description must be at least 10 characters.' })
  description: string;
}
