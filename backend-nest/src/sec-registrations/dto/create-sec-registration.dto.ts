import { IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

export class CreateSecRegistrationDto {
  @IsString()
  @IsNotEmpty({ message: 'Registration Name is required.' })
  registrationName: string;

  @IsString()
  @IsNotEmpty({ message: 'Registration Number is required.' })
  registrationNumber: string;

  @IsDateString({}, { message: 'Date of Incorporation must be a valid ISO date string.' })
  @IsNotEmpty({ message: 'Date of Incorporation is required.' })
  dateOfIncorporation: string;

  @IsString()
  @IsNotEmpty({ message: 'Exemption Category is required.' })
  exemptionCategory: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
