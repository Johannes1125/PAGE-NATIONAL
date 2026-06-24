import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { SecRegistrationsController } from './sec-registrations.controller';
import { SecRegistrationsService } from './sec-registrations.service';

@Module({
  imports: [PrismaModule, SupabaseModule],
  controllers: [SecRegistrationsController],
  providers: [SecRegistrationsService],
  exports: [SecRegistrationsService],
})
export class SecRegistrationsModule {}
