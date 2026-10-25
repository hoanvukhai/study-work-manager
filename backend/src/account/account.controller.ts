import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { AccountService } from './account.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('account')
@UseGuards(JwtAuthGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  /** Tải toàn bộ dữ liệu cá nhân dạng JSON. Truy vấn nặng nên giới hạn 5 lần / phút. */
  @Throttle({ default: { limit: Number(process.env.THROTTLE_AUTH_LIMIT ?? 5), ttl: 60000 } })
  @Get('export')
  async export(@CurrentUser('id') userId: string, @Res({ passthrough: true }) res: Response) {
    const data = await this.accountService.exportData(userId);
    const day = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Disposition', `attachment; filename="study-work-export-${day}.json"`);
    return data;
  }
}
