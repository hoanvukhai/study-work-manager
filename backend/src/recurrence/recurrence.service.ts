import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ObjectLifecycle, ObjectType, Prisma, TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { isValidRule, nextOccurrence } from './recurrence';

@Injectable()
export class RecurrenceService {
  private readonly logger = new Logger(RecurrenceService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Sinh lần lặp kế tiếp của một mục có luật lặp (chỉ sinh một lần cho mỗi mục).
   * - Task: gọi khi Task được đánh dấu xong. Làm sớm thì lần sau tính từ hạn cũ; làm trễ thì lần sau là
   *   mốc đầu tiên sau hiện tại (bỏ qua các lần đã lỡ).
   * - Event: bộ quét gọi khi sự kiện đã bắt đầu.
   * Trả id mục mới, hoặc null nếu không sinh (hết hạn lặp, đã sinh rồi, không có luật...).
   */
  async spawnNext(objectId: string, now: Date = new Date()): Promise<string | null> {
    const o = await this.prisma.object.findUnique({ where: { id: objectId }, include: { spaceObjects: true } });
    if (!o || !o.recurrence || o.recurrenceSpawned || o.lifecycle === ObjectLifecycle.TRASH) return null;
    if (!isValidRule(o.recurrence)) return null;
    const rule = o.recurrence;

    const base = o.type === ObjectType.TASK ? o.dueDate : o.type === ObjectType.EVENT ? o.startAt : null;
    if (!base) return null;

    const after = now.getTime() > base.getTime() ? now : base;
    const next = nextOccurrence(base, rule, after);

    if (!next) {
      await this.prisma.object.update({ where: { id: o.id }, data: { recurrenceSpawned: true } });
      return null;
    }

    const shift = next.getTime() - base.getTime();
    const created = await this.prisma.$transaction(async (tx) => {
      const copy = await tx.object.create({
        data: {
          userId: o.userId,
          type: o.type,
          title: o.title,
          description: o.description,
          status: o.type === ObjectType.TASK ? TaskStatus.TODO : null,
          priority: o.priority,
          estimatedMinutes: o.estimatedMinutes,
          metadata: (o.metadata ?? {}) as Prisma.InputJsonValue,
          recurrence: o.recurrence as Prisma.InputJsonValue,
          dueDate: o.type === ObjectType.TASK ? next : null,
          startAt: o.type === ObjectType.EVENT ? next : null,
          endAt: o.type === ObjectType.EVENT && o.endAt ? new Date(o.endAt.getTime() + shift) : null,
        },
      });
      if (o.spaceObjects.length > 0) {
        await tx.spaceObject.createMany({
          data: o.spaceObjects.map((p) => ({ spaceId: p.spaceId, objectId: copy.id, position: p.position })),
        });
      }
      await tx.object.update({ where: { id: o.id }, data: { recurrenceSpawned: true } });
      return copy;
    });

    return created.id;
  }

  /** Sự kiện lặp đã bắt đầu mà chưa sinh lần kế tiếp → sinh ngay. Trả số lần sinh. */
  async spawnDueEvents(now: Date): Promise<number> {
    const due = await this.prisma.object.findMany({
      where: {
        type: ObjectType.EVENT,
        lifecycle: ObjectLifecycle.ACTIVE,
        recurrenceSpawned: false,
        recurrence: { not: Prisma.DbNull },
        startAt: { lte: now },
      },
      select: { id: true },
      take: 200,
    });
    let n = 0;
    for (const e of due) {
      if (await this.spawnNext(e.id, now)) n += 1;
    }
    return n;
  }

  @Cron('*/15 * * * *')
  async scheduledSpawn() {
    try {
      const n = await this.spawnDueEvents(new Date());
      if (n > 0) this.logger.log(`Đã sinh ${n} sự kiện lặp`);
    } catch (e) {
      this.logger.error('Sinh sự kiện lặp thất bại', e instanceof Error ? e.stack : String(e));
    }
  }
}
