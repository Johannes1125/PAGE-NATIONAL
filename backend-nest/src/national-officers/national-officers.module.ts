import { Module } from '@nestjs/common';
import { NationalOfficersController } from './national-officers.controller';
import { NationalOfficersService } from './national-officers.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NationalOfficersController],
  providers: [NationalOfficersService],
  exports: [NationalOfficersService],
})
export class NationalOfficersModule {}
