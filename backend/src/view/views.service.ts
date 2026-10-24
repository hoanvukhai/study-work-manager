import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ObjectType, TaskStatus, ObjectLifecycle, Prisma } from '@prisma/client';

const spaceSelect = {
  id: true,
  name: true,
  icon: true,
  color: true,
};

@Injectable()
export class ViewsService {
  constructor(private readonly prisma: PrismaService) {}

  async getKanban(userId: string, spaceId?: string) {
    const where: Prisma.ObjectWhereInput = {
      userId,
      type: ObjectType.TASK,
      lifecycle: ObjectLifecycle.ACTIVE,
      deletedAt: null,
      ...(spaceId && {
        spaceObjects: {
          some: { spaceId },
        },
      }),
    };

    const tasks = await this.prisma.object.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      include: {
        spaceObjects: {
          include: { space: { select: spaceSelect } },
        },
      },
    });

    const todo = tasks.filter(t => t.status === TaskStatus.TODO);
    const inProgress = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS);
    const done = tasks.filter(t => t.status === TaskStatus.DONE);
    const cancelled = tasks.filter(t => t.status === TaskStatus.CANCELLED);

    return {
      todo,
      inProgress,
      done,
      cancelled,
      counts: {
        todo: todo.length,
        inProgress: inProgress.length,
        done: done.length,
        cancelled: cancelled.length,
        total: tasks.length,
      },
    };
  }

  async getCalendar(userId: string, from?: string, to?: string, spaceId?: string) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;

    // Sửa BUG-05: Hỗ trợ truy vấn Event kéo dài và không ghi đè OR trong Prisma query
    const timeFilters: Prisma.ObjectWhereInput[] = [];

    if (fromDate && toDate) {
      timeFilters.push(
        // 1. Task hoặc Event có hạn chót nằm trong khoảng
        { dueDate: { gte: fromDate, lte: toDate } },
        // 2. Event bắt đầu trong khoảng
        { startAt: { gte: fromDate, lte: toDate } },
        // 3. Event kết thúc trong khoảng
        { endAt: { gte: fromDate, lte: toDate } },
        // 4. Event kéo dài bao trùm khoảng (bắt đầu trước from và kết thúc sau to)
        {
          AND: [
            { startAt: { lte: fromDate } },
            { endAt: { gte: toDate } },
          ],
        },
      );
    } else {
      timeFilters.push(
        { dueDate: { not: null } },
        { startAt: { not: null } },
      );
    }

    const where: Prisma.ObjectWhereInput = {
      userId,
      lifecycle: ObjectLifecycle.ACTIVE,
      deletedAt: null,
      OR: timeFilters,
      ...(spaceId && {
        spaceObjects: {
          some: { spaceId },
        },
      }),
    };

    return this.prisma.object.findMany({
      where,
      orderBy: [{ dueDate: 'asc' }, { startAt: 'asc' }],
      include: {
        spaceObjects: {
          include: { space: { select: spaceSelect } },
        },
      },
    });
  }

  async getDashboardSummary(userId: string) {
    const now = new Date();

    const [
      spacesCount,
      tasksTotal,
      todoCount,
      inProgressCount,
      doneCount,
      overdueCount,
      notesCount,
      recentSpaces,
      recentTasks,
      upcomingDeadlines,
      upcomingEvents,
    ] = await Promise.all([
      // 1. Số Space hoạt động
      this.prisma.space.count({ where: { userId, archivedAt: null } }),
      // 2. Tổng số task
      this.prisma.object.count({
        where: { userId, type: ObjectType.TASK, lifecycle: ObjectLifecycle.ACTIVE, deletedAt: null },
      }),
      // 3. Số việc Cần làm (TODO)
      this.prisma.object.count({
        where: { userId, type: ObjectType.TASK, lifecycle: ObjectLifecycle.ACTIVE, deletedAt: null, status: TaskStatus.TODO },
      }),
      // 4. Số việc Đang làm (IN_PROGRESS)
      this.prisma.object.count({
        where: { userId, type: ObjectType.TASK, lifecycle: ObjectLifecycle.ACTIVE, deletedAt: null, status: TaskStatus.IN_PROGRESS },
      }),
      // 5. Số việc Đã xong (DONE)
      this.prisma.object.count({
        where: { userId, type: ObjectType.TASK, lifecycle: ObjectLifecycle.ACTIVE, deletedAt: null, status: TaskStatus.DONE },
      }),
      // 6. Số việc Quá hạn (chưa xong và dueDate < now)
      this.prisma.object.count({
        where: {
          userId,
          type: ObjectType.TASK,
          lifecycle: ObjectLifecycle.ACTIVE,
          deletedAt: null,
          status: { not: TaskStatus.DONE },
          dueDate: { lt: now },
        },
      }),
      // 7. Số Ghi chú
      this.prisma.object.count({
        where: { userId, type: ObjectType.NOTE, lifecycle: ObjectLifecycle.ACTIVE, deletedAt: null },
      }),
      // 8. Không gian gần đây
      this.prisma.space.findMany({
        where: { userId, archivedAt: null },
        orderBy: { updatedAt: 'desc' },
        take: 6,
        include: {
          _count: { select: { spaceObjects: true } },
        },
      }),
      // 9. Công việc gần đây
      this.prisma.object.findMany({
        where: { userId, type: ObjectType.TASK, lifecycle: ObjectLifecycle.ACTIVE, deletedAt: null },
        orderBy: { updatedAt: 'desc' },
        take: 8,
        include: {
          spaceObjects: {
            include: { space: { select: spaceSelect } },
          },
        },
      }),
      // 10. Hạn chót sắp tới
      this.prisma.object.findMany({
        where: {
          userId,
          type: ObjectType.TASK,
          lifecycle: ObjectLifecycle.ACTIVE,
          deletedAt: null,
          status: { not: TaskStatus.DONE },
          dueDate: { gte: now },
        },
        orderBy: { dueDate: 'asc' },
        take: 6,
        include: {
          spaceObjects: {
            include: { space: { select: spaceSelect } },
          },
        },
      }),
      // 11. Sự kiện sắp tới (BUG-14)
      this.prisma.object.findMany({
        where: {
          userId,
          type: ObjectType.EVENT,
          lifecycle: ObjectLifecycle.ACTIVE,
          deletedAt: null,
          startAt: { gte: now },
        },
        orderBy: { startAt: 'asc' },
        take: 5,
        include: {
          spaceObjects: {
            include: { space: { select: spaceSelect } },
          },
        },
      }),
    ]);

    const completionRate = tasksTotal > 0 ? Math.round((doneCount / tasksTotal) * 100) : 0;

    return {
      counts: {
        spacesTotal: spacesCount,
        tasksTotal,
        todo: todoCount,
        inProgress: inProgressCount,
        done: doneCount,
        overdue: overdueCount,
        notesTotal: notesCount,
        eventsTotal: upcomingEvents.length,
        completionRate,
      },
      upcomingDeadlines,
      upcomingEvents,
      recentSpaces,
      recentTasks,
    };
  }
}
