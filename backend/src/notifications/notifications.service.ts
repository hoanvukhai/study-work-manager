import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NotificationSettings, ObjectLifecycle, ObjectType, Prisma, RelationType, TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { startOfLocalDay, toLocalDateKey } from '../common/timezone';
import { classifyDue, describeDistance, formatVn, isInQuietHours } from './rules';
import { UpdateNotificationSettingsDto } from './dto/notifications.dto';

export const NOTIFICATION_TYPES = {
  DEADLINE_SOON: 'DEADLINE_SOON',
  OVERDUE: 'OVERDUE',
  EVENT_SOON: 'EVENT_SOON',
  DAILY_DIGEST: 'DAILY_DIGEST',
  STUDY_DUE: 'STUDY_DUE',
  UNBLOCKED: 'UNBLOCKED',
  SYSTEM: 'SYSTEM',
} as const;

const DEFAULT_SETTINGS = {
  remindBeforeMinutes: 1440,
  quietHoursEnabled: false,
  quietStartMinute: 1380,
  quietEndMinute: 420,
  enableDeadline: true,
  enableOverdue: true,
  enableEvent: true,
  enableDigest: true,
  enableStudy: true,
  enableUnblocked: true,
};

/** Từ ngần này thẻ đến hạn trở lên mới nhắc "đến lúc ôn" (tránh làm phiền vì 1–2 thẻ). */
const STUDY_NOTIFY_MIN_CARDS = 5;
const DAY = 24 * 3600 * 1000;
const OPEN_STATUSES = { notIn: [TaskStatus.DONE, TaskStatus.CANCELLED] };

export interface NewNotification {
  userId: string;
  objectId?: string | null;
  type: string;
  title: string;
  message: string;
  dedupeKey: string;
  data?: Prisma.InputJsonValue;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ---------- API người dùng ----------

  async list(userId: string, unreadOnly = false, limit = 50) {
    const [items, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId, ...(unreadOnly && { isRead: false }) },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          objectId: true,
          data: true,
          isRead: true,
          createdAt: true,
        },
      }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);
    return { items, unreadCount };
  }

  async unreadCount(userId: string) {
    return { unreadCount: await this.prisma.notification.count({ where: { userId, isRead: false } }) };
  }

  async markRead(userId: string, id: string) {
    const { count } = await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true, readAt: new Date() },
    });
    if (count === 0) throw new NotFoundException('Không tìm thấy thông báo');
    return { message: 'Đã đánh dấu đã đọc' };
  }

  async markAllRead(userId: string) {
    const { count } = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return { updated: count };
  }

  async remove(userId: string, id: string) {
    const { count } = await this.prisma.notification.deleteMany({ where: { id, userId } });
    if (count === 0) throw new NotFoundException('Không tìm thấy thông báo');
    return { message: 'Đã xoá thông báo' };
  }

  async getSettings(userId: string): Promise<NotificationSettings> {
    return this.prisma.notificationSettings.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  async updateSettings(userId: string, dto: UpdateNotificationSettingsDto) {
    await this.getSettings(userId);
    return this.prisma.notificationSettings.update({ where: { userId }, data: { ...dto } });
  }

  // ---------- Tạo thông báo (có chống trùng) ----------

  /** Trả true nếu tạo mới, false nếu đã có thông báo cùng dedupeKey. */
  async createOnce(n: NewNotification): Promise<boolean> {
    try {
      await this.prisma.notification.create({
        data: {
          userId: n.userId,
          objectId: n.objectId ?? null,
          type: n.type,
          title: n.title,
          message: n.message,
          dedupeKey: n.dedupeKey,
          data: n.data ?? {},
        },
      });
      return true;
    } catch (e) {
      if ((e as { code?: string }).code === 'P2002') return false;
      throw e;
    }
  }

  /** Phát một thông báo hệ thống tới mọi người dùng không bị khoá (dùng cho Admin). */
  async broadcast(title: string, message: string, batchId: string): Promise<number> {
    const users = await this.prisma.user.findMany({ where: { lockedAt: null }, select: { id: true } });
    if (users.length === 0) return 0;
    const { count } = await this.prisma.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        type: NOTIFICATION_TYPES.SYSTEM,
        title,
        message,
        dedupeKey: `SYSTEM:${batchId}`,
      })),
      skipDuplicates: true,
    });
    return count;
  }

  // ---------- Quét định kỳ ----------

  @Cron('*/5 * * * *')
  async scheduledScan() {
    try {
      const created = await this.scanAndCreate(new Date());
      if (created > 0) this.logger.log(`Đã tạo ${created} thông báo`);
    } catch (e) {
      this.logger.error('Quét thông báo thất bại', e instanceof Error ? e.stack : String(e));
    }
  }

  /** 00:00 UTC = 07:00 giờ Việt Nam. */
  @Cron('0 0 * * *', { timeZone: 'UTC' })
  async scheduledDigest() {
    try {
      const created = await this.sendDailyDigest(new Date());
      if (created > 0) this.logger.log(`Đã gửi ${created} bản tin buổi sáng`);
    } catch (e) {
      this.logger.error('Gửi bản tin thất bại', e instanceof Error ? e.stack : String(e));
    }
  }

  /**
   * Quét việc sắp đến hạn / quá hạn / sự kiện sắp diễn ra / thẻ cần ôn và tạo thông báo mới.
   * Nhận `now` để kiểm thử được. Trả về số thông báo đã tạo.
   */
  async scanAndCreate(now: Date): Promise<number> {
    const users = await this.prisma.user.findMany({
      where: { lockedAt: null },
      select: { id: true, notificationSettings: true },
    });

    let created = 0;
    for (const u of users) {
      const s = { ...DEFAULT_SETTINGS, ...(u.notificationSettings ?? {}) };
      if (isInQuietHours(now, s.quietHoursEnabled, s.quietStartMinute, s.quietEndMinute)) continue;
      created += await this.scanUser(u.id, s, now);
    }
    return created;
  }

  private async scanUser(userId: string, s: typeof DEFAULT_SETTINGS, now: Date): Promise<number> {
    let created = 0;
    const dayKey = toLocalDateKey(now);
    const active = { userId, lifecycle: ObjectLifecycle.ACTIVE, deletedAt: null };

    if (s.enableDeadline || s.enableOverdue) {
      const tasks = await this.prisma.object.findMany({
        where: {
          ...active,
          type: ObjectType.TASK,
          status: OPEN_STATUSES,
          dueDate: {
            not: null,
            lte: new Date(now.getTime() + s.remindBeforeMinutes * 60000),
            gte: new Date(now.getTime() - 8 * DAY),
          },
        },
        select: { id: true, title: true, dueDate: true },
      });

      for (const t of tasks) {
        const due = t.dueDate as Date;
        const cls = classifyDue(due, now, s.remindBeforeMinutes);
        if (cls === 'SOON' && s.enableDeadline) {
          created += Number(
            await this.createOnce({
              userId,
              objectId: t.id,
              type: NOTIFICATION_TYPES.DEADLINE_SOON,
              title: 'Sắp đến hạn',
              message: `"${t.title}" đến hạn lúc ${formatVn(due)} (${describeDistance(due, now)}).`,
              dedupeKey: `DEADLINE_SOON:${t.id}:${due.toISOString()}`,
            }),
          );
        } else if (cls === 'OVERDUE' && s.enableOverdue) {
          created += Number(
            await this.createOnce({
              userId,
              objectId: t.id,
              type: NOTIFICATION_TYPES.OVERDUE,
              title: 'Đã quá hạn',
              message: `"${t.title}" ${describeDistance(due, now)} (hạn ${formatVn(due)}).`,
              dedupeKey: `OVERDUE:${t.id}:${dayKey}`,
            }),
          );
        }
      }
    }

    if (s.enableEvent) {
      const events = await this.prisma.object.findMany({
        where: {
          ...active,
          type: ObjectType.EVENT,
          startAt: { gt: now, lte: new Date(now.getTime() + s.remindBeforeMinutes * 60000) },
        },
        select: { id: true, title: true, startAt: true },
      });
      for (const e of events) {
        const start = e.startAt as Date;
        created += Number(
          await this.createOnce({
            userId,
            objectId: e.id,
            type: NOTIFICATION_TYPES.EVENT_SOON,
            title: 'Sự kiện sắp diễn ra',
            message: `"${e.title}" bắt đầu lúc ${formatVn(start)} (${describeDistance(start, now)}).`,
            dedupeKey: `EVENT_SOON:${e.id}:${start.toISOString()}`,
          }),
        );
      }
    }

    if (s.enableStudy) {
      const dueCards = await this.prisma.flashcard.count({
        where: { userId, dueAt: { lte: now }, object: { lifecycle: ObjectLifecycle.ACTIVE, deletedAt: null } },
      });
      if (dueCards >= STUDY_NOTIFY_MIN_CARDS) {
        created += Number(
          await this.createOnce({
            userId,
            type: NOTIFICATION_TYPES.STUDY_DUE,
            title: 'Đến lúc ôn tập',
            message: `Có ${dueCards} thẻ cần ôn hôm nay.`,
            dedupeKey: `STUDY_DUE:${dayKey}`,
            data: { dueCards },
          }),
        );
      }
    }

    return created;
  }

  /** Bản tin buổi sáng: tổng hợp việc đến hạn hôm nay, sự kiện, việc quá hạn, thẻ cần ôn. */
  async sendDailyDigest(now: Date): Promise<number> {
    const dayStart = startOfLocalDay(now);
    const dayEnd = new Date(dayStart.getTime() + DAY);
    const dayKey = toLocalDateKey(now);

    const users = await this.prisma.user.findMany({
      where: { lockedAt: null },
      select: { id: true, notificationSettings: true },
    });

    let created = 0;
    for (const u of users) {
      const s = { ...DEFAULT_SETTINGS, ...(u.notificationSettings ?? {}) };
      if (!s.enableDigest) continue;

      const active = { userId: u.id, lifecycle: ObjectLifecycle.ACTIVE, deletedAt: null };
      const [dueToday, overdue, events, cards] = await Promise.all([
        this.prisma.object.count({
          where: { ...active, type: ObjectType.TASK, status: OPEN_STATUSES, dueDate: { gte: dayStart, lt: dayEnd } },
        }),
        this.prisma.object.count({
          where: { ...active, type: ObjectType.TASK, status: OPEN_STATUSES, dueDate: { lt: dayStart } },
        }),
        this.prisma.object.count({
          where: { ...active, type: ObjectType.EVENT, startAt: { gte: dayStart, lt: dayEnd } },
        }),
        this.prisma.flashcard.count({
          where: { userId: u.id, dueAt: { lte: now }, object: { lifecycle: ObjectLifecycle.ACTIVE, deletedAt: null } },
        }),
      ]);

      if (dueToday + overdue + events + cards === 0) continue;

      const parts = [
        dueToday ? `${dueToday} việc đến hạn` : null,
        events ? `${events} sự kiện` : null,
        overdue ? `${overdue} việc quá hạn` : null,
        cards ? `${cards} thẻ cần ôn` : null,
      ].filter(Boolean);

      created += Number(
        await this.createOnce({
          userId: u.id,
          type: NOTIFICATION_TYPES.DAILY_DIGEST,
          title: 'Bản tin buổi sáng',
          message: `Hôm nay: ${parts.join(', ')}.`,
          dedupeKey: `DAILY_DIGEST:${dayKey}`,
          data: { dueToday, overdue, events, cards },
        }),
      );
    }
    return created;
  }

  // ---------- Móc từ các thao tác khác ----------

  /** Xoá các nhắc hạn chưa đọc của một mục (khi mục xong/huỷ/vào Thùng rác/Lưu trữ). */
  async clearPendingReminders(userId: string, objectId: string) {
    await this.prisma.notification.deleteMany({
      where: {
        userId,
        objectId,
        isRead: false,
        type: { in: [NOTIFICATION_TYPES.DEADLINE_SOON, NOTIFICATION_TYPES.OVERDUE] },
      },
    });
  }

  /** Task vừa xong/huỷ: dọn nhắc hạn và báo cho các việc đang chờ nó mà giờ đã được mở khoá. */
  async onTaskFinished(userId: string, taskId: string) {
    await this.clearPendingReminders(userId, taskId);

    const settings = await this.getSettings(userId);
    if (!settings.enableUnblocked) return;

    const dependents = await this.prisma.objectRelation.findMany({
      where: {
        relationType: RelationType.DEPENDS_ON,
        toObjectId: taskId,
        fromObject: { userId, type: ObjectType.TASK, lifecycle: ObjectLifecycle.ACTIVE, deletedAt: null, status: OPEN_STATUSES },
      },
      select: { fromObject: { select: { id: true, title: true } } },
    });

    for (const d of dependents) {
      const stillBlocking = await this.prisma.objectRelation.count({
        where: {
          relationType: RelationType.DEPENDS_ON,
          fromObjectId: d.fromObject.id,
          toObject: { lifecycle: ObjectLifecycle.ACTIVE, deletedAt: null, status: OPEN_STATUSES },
        },
      });
      if (stillBlocking > 0) continue;
      await this.createOnce({
        userId,
        objectId: d.fromObject.id,
        type: NOTIFICATION_TYPES.UNBLOCKED,
        title: 'Việc đã được mở khoá',
        message: `Bạn có thể bắt đầu "${d.fromObject.title}" — các việc phải làm trước đã xong.`,
        dedupeKey: `UNBLOCKED:${d.fromObject.id}:${taskId}`,
      });
    }
  }
}
