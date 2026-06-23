import { Module } from '@nestjs/common';
import { HistoricalRecordsController } from './historical-records.controller';
import { HistoricalRecordsService } from './historical-records.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HistoricalRecordsController],
  providers: [HistoricalRecordsService],
  exports: [HistoricalRecordsService],
})
export class HistoricalRecordsModule {}
