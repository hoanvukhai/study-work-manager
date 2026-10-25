import { Controller, Get, NotFoundException, Param, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { CalendarService } from './calendar.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  /** Lấy (hoặc tạo) token + đường dẫn tương đối của lịch; giao diện ghép với địa chỉ API công khai. */
  @UseGuards(JwtAuthGuard)
  @Get('feed-token')
  async getFeedToken(@CurrentUser('id') userId: string) {
    const token = await this.calendarService.getOrCreateToken(userId);
    return { token, path: `/calendar/feed/${token}.ics` };
  }

  @UseGuards(JwtAuthGuard)
  @Post('feed-token/rotate')
  async rotate(@CurrentUser('id') userId: string) {
    const token = await this.calendarService.rotateToken(userId);
    return { token, path: `/calendar/feed/${token}.ics` };
  }

  /** CÔNG KHAI (không cần JWT) vì Google Calendar / điện thoại không gửi được header đăng nhập; bảo vệ bằng token bí mật. */
  @Get('feed/:file')
  async feed(@Param('file') file: string, @Res() res: Response) {
    const match = /^([0-9a-f]{64})\.ics$/.exec(file);
    if (!match) throw new NotFoundException('Không tìm thấy lịch');
    const body = await this.calendarService.buildFeed(match[1]);
    res
      .set({
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="study-work.ics"',
        'Cache-Control': 'no-store',
      })
      .send(body);
  }
}
