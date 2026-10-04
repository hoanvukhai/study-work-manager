import { Controller, Get, UseGuards } from '@nestjs/common';
import { ViewsService } from './views.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly viewsService: ViewsService) {}

  @Get('summary')
  getSummary(@CurrentUser('id') userId: string) {
    return this.viewsService.getDashboardSummary(userId);
  }
}
