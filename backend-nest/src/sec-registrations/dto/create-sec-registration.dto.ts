import { IsString, IsOptional } from 'class-validator';

export class CreateSecRegistrationDto {
  @IsString()
  @IsOptional()
  registrationName?: string;

  @IsString()
  @IsOptional()
  registrationNumber?: string;

  @IsString()
  @IsOptional()
  dateOfIncorporation?: string;

  @IsString()
  @IsOptional()
  exemptionCategory?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
