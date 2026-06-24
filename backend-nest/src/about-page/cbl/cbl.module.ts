import { Module } from '@nestjs/common';
import { CblController } from './cbl.controller';
import { CblService } from './cbl.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { CloudinaryModule } from '../../cloudinary/cloudinary.module';
import { SupabaseModule } from '../../supabase/supabase.module';

@Module({
  imports: [PrismaModule, CloudinaryModule, SupabaseModule],
  controllers: [CblController],
  providers: [CblService],
  exports: [CblService],
})
export class CblModule {}
