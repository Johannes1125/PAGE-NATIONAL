import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsIn(['admin', 'organization', 'member', 'reviewer'], {
    message: 'role must be either admin, organization, member, or reviewer',
  })
  role?: string;

  @IsOptional()
  @IsIn(['active', 'inactive'], {
    message: 'status must be either active or inactive',
  })
  status?: string;

  @IsOptional()
  @IsString({ message: 'university must be a string' })
  @MaxLength(255, { message: 'university cannot exceed 255 characters' })
  university?: string;

  @IsOptional()
  @IsString({ message: 'position must be a string' })
  @MaxLength(255, { message: 'position cannot exceed 255 characters' })
  position?: string;
}
