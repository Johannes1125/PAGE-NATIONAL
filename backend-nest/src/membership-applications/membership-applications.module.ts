import { Module } from '@nestjs/common';
import { MembershipApplicationsService } from './membership-applications.service';
import { MembershipApplicationsController } from './membership-applications.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [MembershipApplicationsController],
  providers: [MembershipApplicationsService],
  exports: [MembershipApplicationsService],
})
export class MembershipApplicationsModule {}
