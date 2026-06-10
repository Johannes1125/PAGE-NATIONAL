import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail({}, { message: 'email must be a valid email address' })
  @IsNotEmpty({ message: 'email should not be empty' })
  email: string;

  @IsNotEmpty({ message: 'password should not be empty' })
  @MinLength(6, { message: 'password must be longer than or equal to 6 characters' })
  password: string;

  @IsNotEmpty({ message: 'password_confirmation should not be empty' })
  password_confirmation: string;
}
