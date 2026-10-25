import { Injectable, NotFoundException } from '@nestjs/common';
import { ObjectLifecycle, ObjectType, TaskStatus } from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { buildCalendar, IcsEvent } from './ics';

const DAY = 24 * 3600 * 1000;
/** Chỉ đưa vào lịch các mục trong khoảng này quanh hiện tại (giữ file nhẹ). */
const PAST_DAYS = 14;
const FUTURE_DAYS = 365;
const TASK_ALARM_MINUTES = 30;
const EVENT_ALARM_MINUTES = 15;

@Injectable()
export class CalendarService {
  constructor(private readonly prisma: PrismaService) {}

  /** Token là "chìa khoá" của địa chỉ lịch: ai có địa chỉ là xem được lịch. Tạo mới nếu chưa có. */
  async getOrCreateToken(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { calendarToken: true } });
    if (user?.calendarToken) return user.calendarToken;
    return this.rotateToken(userId);
  }

  /** Tạo token mới — địa chỉ lịch cũ ngừng hoạt động ngay. */
  async rotateToken(userId: string): Promise<string> {
    const token = randomBytes(32).toString('hex');
    await this.prisma.user.update({ where: { id: userId }, data: { calendarToken: token } });
    return token;
  }

  /**
   * Nội dung .ics theo token. Chỉ đưa TIÊU ĐỀ (không đưa mô tả/URL) của Task chưa xong có hạn chót và Event
   * đang hoạt động — địa chỉ này có thể bị dán vào ứng dụng bên thứ ba nên giữ ít thông tin nhất có thể.
   */
  async buildFeed(token: string, now: Date = new Date()): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { calendarToken: token },
      select: { id: true, lockedAt: true },
    });
    // Cùng một lỗi cho token sai và tài khoản bị khoá → không lộ thông tin
    if (!user || user.lockedAt) throw new NotFoundException('Không tìm thấy lịch');

    const from = new Date(now.getTime() - PAST_DAYS * DAY);
    const to = new Date(now.getTime() + FUTURE_DAYS * DAY);
    const active = { userId: user.id, lifecycle: ObjectLifecycle.ACTIVE, deletedAt: null };

    const [tasks, events] = await Promise.all([
      this.prisma.object.findMany({
        where: {
          ...active,
          type: ObjectType.TASK,
          status: { notIn: [TaskStatus.DONE, TaskStatus.CANCELLED] },
          dueDate: { gte: from, lte: to },
        },
        select: { id: true, title: true, dueDate: true },
        take: 2000,
      }),
      this.prisma.object.findMany({
        where: { ...active, type: ObjectType.EVENT, startAt: { gte: from, lte: to } },
        select: { id: true, title: true, startAt: true, endAt: true },
        take: 2000,
      }),
    ]);

    const items: IcsEvent[] = [
      ...tasks.map((t) => ({
        uid: `${t.id}@study-work-manager`,
        summary: `Hạn: ${t.title}`,
        start: t.dueDate as Date,
        alarmMinutes: TASK_ALARM_MINUTES,
      })),
      ...events.map((e) => ({
        uid: `${e.id}@study-work-manager`,
        summary: e.title,
        start: e.startAt as Date,
        end: e.endAt,
        alarmMinutes: EVENT_ALARM_MINUTES,
      })),
    ];

    return buildCalendar('Study & Work', items, now);
  }
}
