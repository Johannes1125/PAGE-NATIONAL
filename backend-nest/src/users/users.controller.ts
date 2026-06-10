import { Controller, Get, Patch, Delete, Body, Param, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import type { Request } from 'express';
import { UsersService } from './users.service';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GetUser } from '../auth/get-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('admin/users')
@UseGuards(TokenAuthGuard, RolesGuard)
@Roles('admin')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  index() {
    return this.usersService.index();
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() adminUser: any,
    @Req() req: Request,
  ) {
    return this.usersService.update(BigInt(id), updateUserDto, adminUser, req.ip || '127.0.0.1');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  deactivate(@Param('id') id: string, @GetUser() adminUser: any, @Req() req: Request) {
    return this.usersService.deactivate(BigInt(id), adminUser, req.ip || '127.0.0.1');
  }

  @Get(':id/activities')
  @HttpCode(HttpStatus.OK)
  activities(@Param('id') id: string) {
    return this.usersService.activities(BigInt(id));
  }
}
