import { IsString, IsOptional, IsIn, MaxLength } from 'class-validator';

export class UpdateNationalOfficerDto {
  @IsString({ message: 'Member Name must be a string.' })
  @IsOptional()
  @MaxLength(255, { message: 'Member Name must not exceed 255 characters.' })
  memberName?: string;

  @IsString({ message: 'Position Category must be a string.' })
  @IsOptional()
  @IsIn(['National Officers', 'Board of Directors'], {
    message: 'Position Category must be either "National Officers" or "Board of Directors".',
  })
  positionCategory?: string;

  @IsString({ message: 'Role must be a string.' })
  @IsOptional()
  @IsIn(['President', 'Vice President', 'Secretary', 'Treasurer', 'Auditor', 'Other'], {
    message: 'Role must be one of: President, Vice President, Secretary, Treasurer, Auditor, Other.',
  })
  role?: string;

  @IsString({ message: 'Description must be a string.' })
  @IsOptional()
  description?: string;

  @IsString({ message: 'Image URL must be a string.' })
  @IsOptional()
  imageUrl?: string;
}
