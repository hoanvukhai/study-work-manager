import { Injectable } from '@nestjs/common';
import { ObjectLifecycle, ObjectType, ReviewGrade, TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { startOfLocalWeek, toLocalDateKey } from '../common/timezone';

const DAY = 24 * 3600 * 1000;
const WEEK = 7 * DAY;

export interface WeekCore {
  tasksCompleted: number;
  reviews: number;
  minutes: number;
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /** `offset` = số tuần lùi về trước (0 = tuần này, 1 = tuần trước...). Tuần tính từ thứ Hai, giờ Việt Nam. */
  async getWeekly(userId: string, offset = 0, now: Date = new Date()) {
    const start = new Date(startOfLocalWeek(now).getTime() - offset * WEEK);
    const end = new Date(start.getTime() + WEEK);
    const prevStart = new Date(start.getTime() - WEEK);

    const active = { userId, type: ObjectType.TASK, lifecycle: { not: ObjectLifecycle.TRASH }, deletedAt: null };

    const [doneTasks, createdCount, dueInWeek, reviews, sessions, prev] = await Promise.all([
      this.prisma.object.findMany({
        where: { ...active, status: TaskStatus.DONE, completedAt: { gte: start, lt: end } },
        select: {
          id: true,
          dueDate: true,
          completedAt: true,
          spaceObjects: { select: { space: { select: { id: true, name: true, icon: true } } } },
        },
      }),
      this.prisma.object.count({ where: { ...active, createdAt: { gte: start, lt: end } } }),
      this.prisma.object.findMany({
        where: { ...active, status: { not: TaskStatus.CANCELLED }, dueDate: { gte: start, lt: end } },
        select: { status: true },
      }),
      this.prisma.flashcardReview.findMany({ where: { userId, reviewedAt: { gte: start, lt: end } }, select: { reviewedAt: true, grade: true } }),
      this.prisma.studySession.findMany({ where: { userId, createdAt: { gte: start, lt: end } }, select: { createdAt: true, minutes: true } }),
      this.core(userId, prevStart, start),
    ]);

    const dayKeys = Array.from({ length: 7 }, (_, i) => toLocalDateKey(new Date(start.getTime() + i * DAY)));
    const days = dayKeys.map((date) => ({ date, tasksCompleted: 0, reviews: 0, minutes: 0 }));
    const slot = (d: Date) => days.find((x) => x.date === toLocalDateKey(d));
    for (const t of doneTasks) if (t.completedAt) slot(t.completedAt)!.tasksCompleted += 1;
    for (const r of reviews) slot(r.reviewedAt)!.reviews += 1;
    for (const s of sessions) slot(s.createdAt)!.minutes += s.minutes;

    // Đúng hạn = xong trước hoặc đúng hạn chót (chỉ tính việc có hạn chót)
    const withDue = doneTasks.filter((t) => t.dueDate && t.completedAt);
    const onTime = withDue.filter((t) => t.completedAt!.getTime() <= t.dueDate!.getTime()).length;

    const bySpace = new Map<string, { id: string; name: string; icon: string; completed: number }>();
    for (const t of doneTasks) {
      for (const so of t.spaceObjects) {
        const cur = bySpace.get(so.space.id) ?? { ...so.space, completed: 0 };
        cur.completed += 1;
        bySpace.set(so.space.id, cur);
      }
    }

    const dueDone = dueInWeek.filter((t) => t.status === TaskStatus.DONE).length;
    const remembered = reviews.filter((r) => r.grade !== ReviewGrade.AGAIN).length;
    const minutes = sessions.reduce((sum, s) => sum + s.minutes, 0);

    return {
      weekStart: toLocalDateKey(start),
      weekEnd: toLocalDateKey(new Date(end.getTime() - DAY)),
      isCurrentWeek: offset === 0,
      tasks: {
        completed: doneTasks.length,
        created: createdCount,
        dueInWeek: dueInWeek.length,
        dueAndDone: dueDone,
        dueNotDone: dueInWeek.length - dueDone,
        onTimeRate: withDue.length > 0 ? Math.round((onTime / withDue.length) * 100) : null,
      },
      study: {
        reviews: reviews.length,
        retentionRate: reviews.length > 0 ? Math.round((remembered / reviews.length) * 100) : null,
        minutes,
        activeDays: days.filter((d) => d.reviews > 0 || d.minutes > 0).length,
      },
      days,
      topSpaces: [...bySpace.values()].sort((a, b) => b.completed - a.completed).slice(0, 5),
      vsPreviousWeek: {
        tasksCompleted: doneTasks.length - prev.tasksCompleted,
        reviews: reviews.length - prev.reviews,
        minutes: minutes - prev.minutes,
      },
    };
  }

  private async core(userId: string, from: Date, to: Date): Promise<WeekCore> {
    const [tasksCompleted, reviews, sessions] = await Promise.all([
      this.prisma.object.count({
        where: { userId, type: ObjectType.TASK, lifecycle: { not: ObjectLifecycle.TRASH }, deletedAt: null, status: TaskStatus.DONE, completedAt: { gte: from, lt: to } },
      }),
      this.prisma.flashcardReview.count({ where: { userId, reviewedAt: { gte: from, lt: to } } }),
      this.prisma.studySession.aggregate({ where: { userId, createdAt: { gte: from, lt: to } }, _sum: { minutes: true } }),
    ]);
    return { tasksCompleted, reviews, minutes: sessions._sum.minutes ?? 0 };
  }
}
