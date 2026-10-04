import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ViewsService } from './views.service';
import { KanbanQueryDto } from './dto/kanban-query.dto';
import { CalendarQueryDto } from './dto/calendar-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('views')
@UseGuards(JwtAuthGuard)
export class ViewsController {
  constructor(private readonly viewsService: ViewsService) {}

  @Get('kanban')
  getKanban(
    @CurrentUser('id') userId: string,
    @Query() query: KanbanQueryDto,
  ) {
    return this.viewsService.getKanban(userId, query.spaceId);
  }

  @Get('calendar')
  getCalendar(
    @CurrentUser('id') userId: string,
    @Query() query: CalendarQueryDto,
  ) {
    return this.viewsService.getCalendar(userId, query.from, query.to, query.spaceId);
  }

  @Get('summary')
  getSummary(@CurrentUser('id') userId: string) {
    return this.viewsService.getDashboardSummary(userId);
  }
}
