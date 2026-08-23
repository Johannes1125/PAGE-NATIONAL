import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { BirCertificationsController } from './bir-certifications.controller';
import { BirCertificationsService } from './bir-certifications.service';

@Module({
  imports: [PrismaModule, CloudinaryModule, SupabaseModule],
  controllers: [BirCertificationsController],
  providers: [BirCertificationsService],
  exports: [BirCertificationsService],
})
export class BirCertificationsModule {}
