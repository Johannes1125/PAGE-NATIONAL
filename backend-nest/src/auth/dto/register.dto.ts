import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'name should not be empty' })
  @IsString({ message: 'name must be a string' })
  name: string;

  @IsEmail({}, { message: 'email must be a valid email address' })
  @IsNotEmpty({ message: 'email should not be empty' })
  email: string;

  @IsNotEmpty({ message: 'password should not be empty' })
  @MinLength(6, { message: 'password must be longer than or equal to 6 characters' })
  password: string;

  @IsNotEmpty({ message: 'password_confirmation should not be empty' })
  password_confirmation: string;

  @IsNotEmpty({ message: 'role should not be empty' })
  @IsIn(['member', 'organization', 'reviewer'], { message: 'role must be either member, organization, or reviewer' })
  role: string;

  @IsOptional()
  @IsString({ message: 'university must be a string' })
  university?: string;

  @IsOptional()
  @IsString({ message: 'position must be a string' })
  position?: string;
}
