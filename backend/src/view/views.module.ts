import { Module } from '@nestjs/common';
import { ViewsService } from './views.service';
import { ViewsController } from './views.controller';
import { DashboardController } from './dashboard.controller';

@Module({
  controllers: [ViewsController, DashboardController],
  providers: [ViewsService],
  exports: [ViewsService],
})
export class ViewsModule {}
