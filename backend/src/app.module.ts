import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SpacesModule } from './space/spaces.module';
import { ObjectsModule } from './object/objects.module';
import { RelationsModule } from './relation/relations.module';
import { ViewsModule } from './view/views.module';
import { PlanningModule } from './planning/planning.module';
import { StudyModule } from './study/study.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';
import { MailModule } from './mail/mail.module';
import { CalendarModule } from './calendar/calendar.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    // Giới hạn chung: mặc định 300 yêu cầu / phút / IP (đổi bằng THROTTLE_LIMIT)
    ThrottlerModule.forRoot([{ ttl: 60000, limit: Number(process.env.THROTTLE_LIMIT ?? 300) }]),
    PrismaModule,
    AuthModule,
    SpacesModule,
    ObjectsModule,
    RelationsModule,
    ViewsModule,
    PlanningModule,
    StudyModule,
    KnowledgeModule,
    NotificationsModule,
    AdminModule,
    MailModule,
    CalendarModule,
    ReportsModule,
  ],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}


