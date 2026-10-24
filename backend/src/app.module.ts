import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SpacesModule } from './space/spaces.module';
import { ObjectsModule } from './object/objects.module';
import { RelationsModule } from './relation/relations.module';
import { ViewsModule } from './view/views.module';
import { PlanningModule } from './planning/planning.module';
import { StudyModule } from './study/study.module';
import { KnowledgeModule } from './knowledge/knowledge.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    SpacesModule,
    ObjectsModule,
    RelationsModule,
    ViewsModule,
    PlanningModule,
    StudyModule,
    KnowledgeModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}


