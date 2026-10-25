import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

class WeeklyQueryDto {
  /** Số tuần lùi về trước: 0 = tuần này. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(520)
  offset?: number;
}

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('weekly')
  weekly(@CurrentUser('id') userId: string, @Query() q: WeeklyQueryDto) {
    return this.reportsService.getWeekly(userId, q.offset ?? 0);
  }
}
