import { Module } from '@nestjs/common';
import { NationalOfficersController } from './national-officers.controller';
import { NationalOfficersService } from './national-officers.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [PrismaModule, SupabaseModule, CloudinaryModule],
  controllers: [NationalOfficersController],
  providers: [NationalOfficersService],
  exports: [NationalOfficersService],
})
export class NationalOfficersModule {}
