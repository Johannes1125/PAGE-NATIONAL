import { Controller, Post, Get, Body, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { TokenAuthGuard } from './token-auth.guard';
import { GetUser } from './get-user.decorator';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto, @Req() req: Request) {
    return this.authService.login(loginDto, req.ip || '127.0.0.1');
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() registerDto: RegisterDto, @Req() req: Request) {
    return this.authService.register(registerDto, req.ip || '127.0.0.1');
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto, @Req() req: Request) {
    return this.authService.forgotPassword(forgotPasswordDto, req.ip || '127.0.0.1');
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto, @Req() req: Request) {
    return this.authService.resetPassword(resetPasswordDto, req.ip || '127.0.0.1');
  }

  @UseGuards(TokenAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@GetUser() user: any, @Req() req: Request) {
    return this.authService.logout(user, req.ip || '127.0.0.1');
  }

  @UseGuards(TokenAuthGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  me(@GetUser() user: any) {
    return this.authService.me(user);
  }
}
