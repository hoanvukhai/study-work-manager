import { Injectable } from '@nestjs/common';
import { ObjectLifecycle, ObjectType, RelationType, TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { buildOverview, PlanOverview, PlanTask } from './scoring';

@Injectable()
export class PlanningService {
  constructor(private readonly prisma: PrismaService) {}

  /** Gợi ý "Hôm nay làm gì?", việc đang bị chặn và mức tải 7 ngày tới của người dùng. */
  async getOverview(userId: string, now: Date = new Date()): Promise<PlanOverview> {
    const tasks = await this.prisma.object.findMany({
      where: {
        userId,
        type: ObjectType.TASK,
        lifecycle: ObjectLifecycle.ACTIVE,
        deletedAt: null,
        status: { notIn: [TaskStatus.DONE, TaskStatus.CANCELLED] },
      },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        dueDate: true,
        estimatedMinutes: true,
      },
    });

    const ids = tasks.map((t) => t.id);
    const deps = ids.length
      ? await this.prisma.objectRelation.findMany({
          where: {
            relationType: RelationType.DEPENDS_ON,
            fromObjectId: { in: ids },
            toObjectId: { in: ids },
          },
          select: { fromObjectId: true, toObjectId: true },
        })
      : [];

    const byId = new Map(tasks.map((t) => [t.id, t]));
    const blockedBy = new Map<string, { id: string; title: string }[]>();
    const unblocks = new Map<string, number>();
    for (const d of deps) {
      // d.from phụ thuộc d.to: d.to là tiền đề chưa xong (vì nó nằm trong tập việc chưa xong)
      const prereq = byId.get(d.toObjectId)!;
      const list = blockedBy.get(d.fromObjectId) ?? [];
      list.push({ id: prereq.id, title: prereq.title });
      blockedBy.set(d.fromObjectId, list);
      unblocks.set(d.toObjectId, (unblocks.get(d.toObjectId) ?? 0) + 1);
    }

    const planTasks: PlanTask[] = tasks.map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate,
      estimatedMinutes: t.estimatedMinutes,
      blockedBy: blockedBy.get(t.id) ?? [],
      unblocksCount: unblocks.get(t.id) ?? 0,
    }));

    return buildOverview(planTasks, now);
  }
}
