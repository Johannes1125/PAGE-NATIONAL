import { Injectable, UnauthorizedException, ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async login(loginDto: LoginDto, ipAddress: string) {
    const { email, password } = loginDto;

    const user = await this.prisma.users.findUnique({
      where: { email },
    });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Invalid email address or password.');
    }

    if (user.status !== 'active') {
      throw new ForbiddenException('This account has been deactivated. Please contact the PAGE administration.');
    }

    // Generate a plain token
    const plainToken = crypto.randomBytes(40).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(plainToken).digest('hex');

    // Update user's api token
    await this.prisma.users.update({
      where: { id: user.id },
      data: { api_token_hashed: hashedToken },
    });

    // Log user activity
    await this.prisma.user_activities.create({
      data: {
        user_id: user.id,
        action: 'Logged in successfully.',
        ip_address: ipAddress,
      },
    });

    return {
      success: true,
      token: plainToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        university: user.university,
        position: user.position,
        status: user.status,
      },
      message: 'Login successful',
    };
  }

  async logout(user: any, ipAddress: string) {
    if (user) {
      await this.prisma.users.update({
        where: { id: user.id },
        data: { api_token_hashed: null },
      });

      await this.prisma.user_activities.create({
        data: {
          user_id: user.id,
          action: 'Logged out.',
          ip_address: ipAddress,
        },
      });
    }

    return {
      success: true,
      message: 'Logged out successfully.',
    };
  }

  async me(user: any) {
    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        university: user.university,
        position: user.position,
        status: user.status,
      },
    };
  }

  async register(registerDto: RegisterDto, ipAddress: string) {
    const { name, email, password, password_confirmation, role, university, position } = registerDto;

    if (password !== password_confirmation) {
      throw new HttpException(
        {
          message: 'Validation error',
          errors: {
            password: ['The password confirmation does not match.'],
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const existingUser = await this.prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new HttpException(
        {
          message: 'Validation error',
          errors: {
            email: ['The email has already been taken.'],
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const hashedPassword = bcrypt.hashSync(password, 12);

    const newUser = await this.prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        university: university || null,
        position: position || null,
        status: 'active',
      },
    });

    await this.prisma.user_activities.create({
      data: {
        user_id: newUser.id,
        action: 'Registered a new account.',
        ip_address: ipAddress,
      },
    });

    return {
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        university: newUser.university,
        position: newUser.position,
        status: newUser.status,
      },
      message: 'Registration successful! You can now log in.',
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto, ipAddress: string) {
    const { email } = forgotPasswordDto;

    const user = await this.prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      throw new HttpException('No account found with this email address.', HttpStatus.NOT_FOUND);
    }

    const tempToken = crypto.randomBytes(16).toString('hex');

    await this.prisma.user_activities.create({
      data: {
        user_id: user.id,
        action: 'Requested password reset link.',
        ip_address: ipAddress,
      },
    });

    return {
      success: true,
      message: 'A password reset link has been successfully simulated and dispatched!',
      reset_token: tempToken,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto, ipAddress: string) {
    const { email, password, password_confirmation } = resetPasswordDto;

    if (password !== password_confirmation) {
      throw new HttpException(
        {
          message: 'Validation error',
          errors: {
            password: ['The password confirmation does not match.'],
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const user = await this.prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      throw new HttpException('No account found with this email address.', HttpStatus.NOT_FOUND);
    }

    const hashedPassword = bcrypt.hashSync(password, 12);

    await this.prisma.users.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    await this.prisma.user_activities.create({
      data: {
        user_id: user.id,
        action: 'Reset password successfully.',
        ip_address: ipAddress,
      },
    });

    return {
      success: true,
      message: 'Your password has been successfully reset. You can now log in with your new password!',
    };
  }
}
