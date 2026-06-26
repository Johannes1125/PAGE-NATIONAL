import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateBirCertificationDto {
  @IsString()
  @IsNotEmpty({ message: 'Registration Name is required.' })
  registrationName: string;

  @IsString()
  @IsNotEmpty({ message: 'TIN Number is required.' })
  tinNumber: string;

  @IsString()
  @IsNotEmpty({ message: 'Certification Number is required.' })
  certificationNumber: string;

  @IsString()
  @IsNotEmpty({ message: 'Exemption Category is required.' })
  exemptionCategory: string;

  @IsDateString({}, { message: 'Date of Issuance must be a valid ISO date string.' })
  @IsNotEmpty({ message: 'Date of Issuance is required.' })
  dateOfIssuance: string;
}
