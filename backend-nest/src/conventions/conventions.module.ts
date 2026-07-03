import { Module } from '@nestjs/common';
import { ConventionsController } from './conventions.controller';
import { ConventionsService } from './conventions.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [PrismaModule, CloudinaryModule, SupabaseModule],
  controllers: [ConventionsController],
  providers: [ConventionsService],
})
export class ConventionsModule {}
