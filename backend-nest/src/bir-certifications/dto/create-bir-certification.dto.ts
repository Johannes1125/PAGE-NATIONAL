import { IsString, IsOptional } from 'class-validator';

export class CreateBirCertificationDto {
  @IsString()
  @IsOptional()
  registrationName?: string;

  @IsString()
  @IsOptional()
  tinNumber?: string;

  @IsString()
  @IsOptional()
  certificationNumber?: string;

  @IsString()
  @IsOptional()
  exemptionCategory?: string;

  @IsString()
  @IsOptional()
  dateOfIssuance?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  receiptUrl?: string;
}
