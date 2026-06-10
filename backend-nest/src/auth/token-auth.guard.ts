import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class TokenAuthGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers['authorization'];

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Unauthorized: Missing or invalid token format.');
    }

    const token = authorization.substring(7);
    const tokenHashed = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.prisma.users.findFirst({
      where: {
        api_token_hashed: tokenHashed,
        status: 'active',
      },
    });

    if (!user) {
      throw new UnauthorizedException('Unauthorized: Token is expired, invalid, or user account is deactivated.');
    }

    // Attach user to the request for controllers and other guards
    request.user = user;
    return true;
  }
}
