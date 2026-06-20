import { Module } from '@nestjs/common';
import { AboutPageController } from './about-page.controller';
import { AboutPageService } from './about-page.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [AboutPageController],
  providers: [AboutPageService],
  exports: [AboutPageService],
})
export class AboutPageModule {}
