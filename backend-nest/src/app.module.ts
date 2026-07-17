import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { ArticlesModule } from './articles/articles.module';
import { MessagesModule } from './messages/messages.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { UsersModule } from './users/users.module';
import { AboutPageModule } from './about-page/about-page.module';
import { CblModule } from './about-page/cbl/cbl.module';
import { HistoricalRecordsModule } from './historical-records/historical-records.module';
import { PageLogoModule } from './page-logo/page-logo.module';
import { NationalOfficersModule } from './national-officers/national-officers.module';
import { SecRegistrationsModule } from './sec-registrations/sec-registrations.module';
import { BirCertificationsModule } from './bir-certifications/bir-certifications.module';
import { ChaptersModule } from './chapters/chapters.module';
import { ConventionsModule } from './conventions/conventions.module';
import { MembershipApplicationsModule } from './membership-applications/membership-applications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CloudinaryModule,
    SupabaseModule,
    AuthModule,
    PostsModule,
    ArticlesModule,
    MessagesModule,
    DashboardModule,
    UsersModule,
    AboutPageModule,
    CblModule,
    HistoricalRecordsModule,
    PageLogoModule,
    NationalOfficersModule,
    SecRegistrationsModule,
    BirCertificationsModule,
    ChaptersModule,
    ConventionsModule,
    MembershipApplicationsModule,
  ],
})
export class AppModule {}


