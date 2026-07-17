import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class OptionalTokenAuthGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers['authorization'];

    if (!authorization || !authorization.startsWith('Bearer ')) {
      request.user = null;
      return true;
    }

    const token = authorization.substring(7);
    const tokenHashed = crypto.createHash('sha256').update(token).digest('hex');

    try {
      const user = await this.prisma.users.findFirst({
        where: {
          api_token_hashed: tokenHashed,
          status: 'active',
        },
      });
      request.user = user || null;
    } catch (e) {
      request.user = null;
    }

    return true;
  }
}
