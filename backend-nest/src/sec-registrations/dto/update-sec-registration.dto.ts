import { IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

export class UpdateSecRegistrationDto {
  @IsString()
  @IsNotEmpty({ message: 'Registration Name must not be empty.' })
  @IsOptional()
  registrationName?: string;

  @IsString()
  @IsNotEmpty({ message: 'Registration Number must not be empty.' })
  @IsOptional()
  registrationNumber?: string;

  @IsDateString({}, { message: 'Date of Incorporation must be a valid ISO date string.' })
  @IsNotEmpty({ message: 'Date of Incorporation must not be empty.' })
  @IsOptional()
  dateOfIncorporation?: string;

  @IsString()
  @IsNotEmpty({ message: 'Exemption Category must not be empty.' })
  @IsOptional()
  exemptionCategory?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
