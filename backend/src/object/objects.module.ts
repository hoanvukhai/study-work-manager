import { Module } from '@nestjs/common';
import { ObjectsService } from './objects.service';
import { ObjectsController } from './objects.controller';
import { KnowledgeModule } from '../knowledge/knowledge.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { RecurrenceModule } from '../recurrence/recurrence.module';

@Module({
  imports: [KnowledgeModule, NotificationsModule, RecurrenceModule],
  controllers: [ObjectsController],
  providers: [ObjectsService],
  exports: [ObjectsService],
})
export class ObjectsModule {}
