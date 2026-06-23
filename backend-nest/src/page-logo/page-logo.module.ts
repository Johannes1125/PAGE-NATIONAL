import { Module } from '@nestjs/common';
import { PageLogoController } from './page-logo.controller';
import { PageLogoService } from './page-logo.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [PageLogoController],
  providers: [PageLogoService],
})
export class PageLogoModule {}
