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

    return {
      todo,
      inProgress,
      done,
      counts: {
        todo: todo.length,
        inProgress: inProgress.length,
        done: done.length,
        total: tasks.length,
      },
    };
  }

  async getCalendar(userId: string, from?: string, to?: string, spaceId?: string) {
    const where: Prisma.ObjectWhereInput = {
      userId,
      lifecycle: ObjectLifecycle.ACTIVE,
      deletedAt: null,
      OR: [
        { dueDate: { not: null } },
        { startAt: { not: null } },
      ],
      ...(spaceId && {
        spaceObjects: {
          some: { spaceId },
        },
      }),
      ...(from && to && {
        OR: [
          { dueDate: { gte: new Date(from), lte: new Date(to) } },
          { startAt: { gte: new Date(from), lte: new Date(to) } },
        ],
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
      tasks,
      notesCount,
      recentSpaces,
    ] = await Promise.all([
      this.prisma.space.count({ where: { userId, isArchived: false } }),
      this.prisma.object.findMany({
        where: {
          userId,
          type: ObjectType.TASK,
          lifecycle: ObjectLifecycle.ACTIVE,
          deletedAt: null,
        },
        orderBy: { dueDate: 'asc' },
        include: {
          spaceObjects: {
            include: { space: { select: spaceSelect } },
          },
        },
      }),
      this.prisma.object.count({
        where: {
          userId,
          type: ObjectType.NOTE,
          lifecycle: ObjectLifecycle.ACTIVE,
          deletedAt: null,
        },
      }),
      this.prisma.space.findMany({
        where: { userId, isArchived: false },
        orderBy: { updatedAt: 'desc' },
        take: 6,
        include: {
          _count: { select: { spaceObjects: true } },
        },
      }),
    ]);

    const todoTasks = tasks.filter(t => t.status === TaskStatus.TODO);
    const inProgressTasks = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS);
    const doneTasks = tasks.filter(t => t.status === TaskStatus.DONE);
    const overdueTasks = tasks.filter(
      t => t.status !== TaskStatus.DONE && t.dueDate && new Date(t.dueDate) < now,
    );

    const upcomingDeadlines = tasks
      .filter(t => t.status !== TaskStatus.DONE && t.dueDate && new Date(t.dueDate) >= now)
      .slice(0, 6);

    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? Math.round((doneTasks.length / totalTasks) * 100) : 0;

    return {
      counts: {
        spacesTotal: spacesCount,
        tasksTotal: totalTasks,
        todo: todoTasks.length,
        inProgress: inProgressTasks.length,
        done: doneTasks.length,
        overdue: overdueTasks.length,
        notesTotal: notesCount,
        completionRate,
      },
      upcomingDeadlines,
      recentSpaces,
      recentTasks: tasks.slice(0, 8),
    };
  }
}
