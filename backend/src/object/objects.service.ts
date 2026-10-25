import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateObjectDto } from './dto/create-object.dto';
import { UpdateObjectDto } from './dto/update-object.dto';
import { QueryObjectsDto } from './dto/query-objects.dto';
import { KnowledgeService } from '../knowledge/knowledge.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RecurrenceService } from '../recurrence/recurrence.service';
import { ObjectLifecycle, ObjectType, TaskStatus, Priority } from '@prisma/client';

/** Giới hạn cứng số mục trả về một lần (chống truy vấn quá nặng). */
export const MAX_PAGE_SIZE = 500;

@Injectable()
export class ObjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly knowledge: KnowledgeService,
    private readonly notifications: NotificationsService,
    private readonly recurrence: RecurrenceService,
  ) {}

  async create(userId: string, dto: CreateObjectDto) {
    if (dto.spaceId) {
      const space = await this.prisma.space.findFirst({
        where: { id: dto.spaceId, userId },
      });
      if (!space) {
        throw new NotFoundException('Không tìm thấy Không gian được chọn');
      }
    }

    // Kiểm tra ràng buộc theo loại đối tượng (QD-07, SEC-06)
    if (dto.type === ObjectType.EVENT) {
      if (!dto.startAt) {
        throw new BadRequestException('Sự kiện bắt buộc phải có thời gian bắt đầu');
      }
      if (dto.startAt && dto.endAt) {
        if (new Date(dto.endAt).getTime() <= new Date(dto.startAt).getTime()) {
          throw new BadRequestException('Thời gian kết thúc phải sau thời gian bắt đầu');
        }
      }
    } else if (dto.type === ObjectType.REFERENCE) {
      if (!dto.url?.trim()) {
        throw new BadRequestException('Tài liệu tham khảo bắt buộc phải có đường dẫn URL');
      }
      try {
        new URL(dto.url);
      } catch {
        throw new BadRequestException('Đường dẫn URL không hợp lệ');
      }
    }

    this.assertRecurrenceAllowed(dto.type, dto.recurrence, dto.type === ObjectType.TASK ? dto.dueDate : dto.startAt);

    const defaultStatus = dto.type === ObjectType.TASK ? (dto.status ?? TaskStatus.TODO) : null;
    const defaultPriority =
      dto.type === ObjectType.TASK || dto.type === ObjectType.EVENT
        ? (dto.priority ?? Priority.MEDIUM)
        : null;

    // BUG-07: Đưa tạo Object và gán Space vào transaction
    const created = await this.prisma.$transaction(async (tx) => {
      const object = await tx.object.create({
        data: {
          userId,
          type: dto.type,
          title: dto.title.trim(),
          description: dto.description?.trim() || null,
          status: defaultStatus,
          priority: defaultPriority,
          dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
          startAt: dto.startAt ? new Date(dto.startAt) : null,
          endAt: dto.endAt ? new Date(dto.endAt) : null,
          url: dto.url?.trim() || null,
          estimatedMinutes: dto.type === ObjectType.TASK ? (dto.estimatedMinutes ?? null) : null,
          ...(dto.recurrence && { recurrence: dto.recurrence as unknown as Prisma.InputJsonValue }),
          metadata: dto.metadata ?? {},
          lifecycle: ObjectLifecycle.ACTIVE,
        },
      });

      if (dto.spaceId) {
        await tx.spaceObject.create({
          data: {
            spaceId: dto.spaceId,
            objectId: object.id,
          },
        });
      }

      return object;
    });

    if (created.description) await this.knowledge.syncMentions(userId, created.id, created.description);

    return this.findOne(userId, created.id);
  }

  private buildWhere(userId: string, query: QueryObjectsDto): Prisma.ObjectWhereInput {
    return {
      userId,
      deletedAt: query.lifecycle === ObjectLifecycle.TRASH ? { not: null } : null,
      ...(query.lifecycle ? { lifecycle: query.lifecycle } : { lifecycle: ObjectLifecycle.ACTIVE }),
      ...(query.type && { type: query.type }),
      ...(query.status && { status: query.status }),
      ...(query.priority && { priority: query.priority }),
      ...(query.spaceId && {
        spaceObjects: {
          some: { spaceId: query.spaceId },
        },
      }),
      ...(query.unassigned === true || query.unassigned === 'true'
        ? {
            spaceObjects: {
              none: {},
            },
          }
        : {}),
      ...(query.search && {
        OR: [
          { title: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };
  }

  /** Tổng số mục khớp bộ lọc (không tính giới hạn) — trả qua header X-Total-Count. */
  countAll(userId: string, query: QueryObjectsDto) {
    return this.prisma.object.count({ where: this.buildWhere(userId, query) });
  }

  async findAll(userId: string, query: QueryObjectsDto) {
    return this.prisma.object.findMany({
      where: this.buildWhere(userId, query),
      orderBy: [{ createdAt: 'desc' }],
      take: Math.min(query.limit ?? MAX_PAGE_SIZE, MAX_PAGE_SIZE),
      skip: query.offset ?? 0,
      include: {
        spaceObjects: {
          include: {
            space: {
              select: { id: true, name: true, icon: true, color: true },
            },
          },
        },
      },
    });
  }

  async findOne(userId: string, id: string) {
    const object = await this.prisma.object.findFirst({
      where: { id, userId },
      include: {
        spaceObjects: {
          include: {
            space: {
              select: { id: true, name: true, icon: true, color: true },
            },
          },
        },
      },
    });

    if (!object) {
      throw new NotFoundException('Không tìm thấy mục được yêu cầu');
    }

    return object;
  }

  async update(userId: string, id: string, dto: UpdateObjectDto) {
    const existing = await this.findOne(userId, id);

    // Kiểm tra ràng buộc thời gian sự kiện (SEC-06)
    const newStart = dto.startAt !== undefined ? (dto.startAt ? new Date(dto.startAt) : null) : existing.startAt;
    const newEnd = dto.endAt !== undefined ? (dto.endAt ? new Date(dto.endAt) : null) : existing.endAt;
    if (existing.type === ObjectType.EVENT && newStart && newEnd) {
      if (newEnd.getTime() <= newStart.getTime()) {
        throw new BadRequestException('Thời gian kết thúc phải sau thời gian bắt đầu');
      }
    }

    if (existing.type === ObjectType.REFERENCE && dto.url !== undefined && dto.url) {
      try {
        new URL(dto.url);
      } catch {
        throw new BadRequestException('Đường dẫn URL không hợp lệ');
      }
    }

    // Luật lặp: kiểm tra theo kết quả sau khi sửa (luật mới + ngày mới)
    const finalRule = dto.recurrence !== undefined ? dto.recurrence : (existing.recurrence as unknown);
    const finalDate =
      existing.type === ObjectType.TASK
        ? dto.dueDate !== undefined ? dto.dueDate : existing.dueDate
        : dto.startAt !== undefined ? dto.startAt : existing.startAt;
    this.assertRecurrenceAllowed(existing.type, finalRule, finalDate);

    const normRule = (r: unknown) => {
      if (!r) return null;
      const x = r as { freq: string; interval: number; until?: string | null };
      return JSON.stringify({ freq: x.freq, interval: x.interval, until: x.until ? new Date(x.until).toISOString() : null });
    };
    const ruleChanged = dto.recurrence !== undefined && normRule(dto.recurrence) !== normRule(existing.recurrence);

    // BUG-06: Không cho đổi type và lifecycle qua API sửa thường
    await this.prisma.object.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title.trim() }),
        ...(dto.description !== undefined && { description: dto.description?.trim() || null }),
        // Chỉ Task có trạng thái; chỉ Task/Event có độ ưu tiên (khớp ràng buộc CHECK ở CSDL)
        ...(dto.status !== undefined && existing.type === ObjectType.TASK && { status: dto.status }),
        ...(dto.priority !== undefined &&
          (existing.type === ObjectType.TASK || existing.type === ObjectType.EVENT) && { priority: dto.priority }),
        ...(dto.dueDate !== undefined && { dueDate: dto.dueDate ? new Date(dto.dueDate) : null }),
        ...(dto.startAt !== undefined && { startAt: dto.startAt ? new Date(dto.startAt) : null }),
        ...(dto.endAt !== undefined && { endAt: dto.endAt ? new Date(dto.endAt) : null }),
        ...(dto.url !== undefined && { url: dto.url?.trim() || null }),
        ...(dto.estimatedMinutes !== undefined && existing.type === ObjectType.TASK && { estimatedMinutes: dto.estimatedMinutes }),
        ...(dto.metadata !== undefined && { metadata: dto.metadata }),
        // Chỉ ghi khi luật thật sự đổi — Drawer gửi lại nguyên luật mỗi lần lưu, không được làm "quên" việc đã sinh lần kế tiếp
        ...(ruleChanged && {
          recurrence: dto.recurrence === null ? Prisma.DbNull : (dto.recurrence as unknown as Prisma.InputJsonValue),
          recurrenceSpawned: false,
        }),
      },
    });

    // Task vừa xong/huỷ → dọn nhắc hạn và báo các việc được mở khoá
    if (
      existing.type === ObjectType.TASK &&
      (dto.status === TaskStatus.DONE || dto.status === TaskStatus.CANCELLED) &&
      existing.status !== dto.status
    ) {
      await this.notifications.onTaskFinished(userId, id);
    }

    // Task lặp lại vừa xong → sinh lần kế tiếp
    let spawnedId: string | null = null;
    if (existing.type === ObjectType.TASK && dto.status === TaskStatus.DONE && existing.status !== TaskStatus.DONE) {
      spawnedId = await this.recurrence.spawnNext(id);
    }

    // Nội dung đổi → đồng bộ liên kết tự động từ [[Tiêu đề]]
    if (dto.description !== undefined) {
      await this.knowledge.syncMentions(userId, id, dto.description?.trim() || null);
    }

    // Dời hạn muộn hơn: cảnh báo các việc đang chờ việc này mà hạn của chúng sẽ bị vượt qua
    let planningWarnings: { id: string; title: string; dueDate: Date | null }[] = [];
    if (existing.type === ObjectType.TASK && dto.dueDate) {
      const newDue = new Date(dto.dueDate);
      if (!existing.dueDate || newDue.getTime() > existing.dueDate.getTime()) {
        planningWarnings = await this.findDelayConflicts(userId, id, newDue);
      }
    }

    const result = await this.findOne(userId, id);
    return {
      ...result,
      ...(spawnedId && { nextOccurrenceId: spawnedId }),
      ...(planningWarnings.length > 0 && { planningWarnings }),
    };
  }

  async updateLifecycle(userId: string, id: string, action: 'ARCHIVE' | 'TRASH' | 'RESTORE') {
    const existing = await this.findOne(userId, id);

    let lifecycle: ObjectLifecycle = ObjectLifecycle.ACTIVE;
    let archivedAt: Date | null | undefined = null;
    let deletedAt: Date | null = null;

    if (action === 'TRASH') {
      lifecycle = ObjectLifecycle.TRASH;
      deletedAt = new Date();
      archivedAt = undefined; // giữ nguyên để khôi phục về đúng trạng thái trước đó
    } else if (action === 'ARCHIVE') {
      lifecycle = ObjectLifecycle.ARCHIVED;
      archivedAt = new Date();
    } else if (action === 'RESTORE') {
      // Từ Thùng rác: nếu trước đó đã Lưu trữ thì quay về Lưu trữ, ngược lại về ACTIVE
      if (existing.lifecycle === ObjectLifecycle.TRASH && existing.archivedAt) {
        lifecycle = ObjectLifecycle.ARCHIVED;
        archivedAt = existing.archivedAt;
      }
    }

    await this.prisma.object.update({
      where: { id },
      data: { lifecycle, deletedAt, ...(archivedAt !== undefined && { archivedAt }) },
    });

    if (action === 'TRASH' || action === 'ARCHIVE') {
      await this.notifications.clearPendingReminders(userId, id);
    }

    return this.findOne(userId, id);
  }

  async remove(userId: string, id: string) {
    const existing = await this.findOne(userId, id);
    if (existing.lifecycle !== ObjectLifecycle.TRASH) {
      throw new BadRequestException('Chỉ có thể xoá vĩnh viễn mục đang nằm trong Thùng rác');
    }
    await this.prisma.object.delete({ where: { id } });
    return { message: 'Đã xoá mục thành công' };
  }

  async attachToSpace(userId: string, spaceId: string, objectId: string) {
    const [space, object] = await Promise.all([
      this.prisma.space.findFirst({ where: { id: spaceId, userId } }),
      this.prisma.object.findFirst({ where: { id: objectId, userId } }),
    ]);

    if (!space) throw new NotFoundException('Không tìm thấy Không gian');
    if (!object) throw new NotFoundException('Không tìm thấy mục');

    await this.prisma.spaceObject.upsert({
      where: { spaceId_objectId: { spaceId, objectId } },
      update: {},
      create: { spaceId, objectId },
    });

    return this.findOne(userId, objectId);
  }

  async removeFromSpace(userId: string, spaceId: string, objectId: string) {
    const spaceObject = await this.prisma.spaceObject.findFirst({
      where: {
        spaceId,
        objectId,
        space: { userId },
      },
    });

    if (!spaceObject) {
      throw new NotFoundException('Mục không nằm trong Không gian này');
    }

    await this.prisma.spaceObject.delete({
      where: { spaceId_objectId: { spaceId, objectId } },
    });

    return { message: 'Đã gỡ mục khỏi Không gian' };
  }

  async convertType(userId: string, id: string, targetType: ObjectType) {
    const existing = await this.findOne(userId, id);
    if (existing.type === targetType) {
      return existing;
    }

    let nextStatus: TaskStatus | null = null;
    let nextPriority: Priority | null = null;
    let nextDueDate: Date | null = null;
    let nextStartAt: Date | null = null;
    let nextEndAt: Date | null = null;
    let nextUrl: string | null = null;

    if (targetType === ObjectType.TASK) {
      nextStatus = existing.status || TaskStatus.TODO;
      nextPriority = existing.priority || Priority.MEDIUM;
      nextDueDate = existing.dueDate || existing.startAt || null;
    } else if (targetType === ObjectType.EVENT) {
      nextPriority = existing.priority || Priority.MEDIUM;
      const baseDate = existing.dueDate || existing.startAt || new Date();
      nextStartAt = baseDate;
      nextEndAt = existing.endAt || new Date(baseDate.getTime() + 60 * 60 * 1000);
    } else if (targetType === ObjectType.REFERENCE) {
      nextUrl = existing.url || null;
    }

    await this.prisma.object.update({
      where: { id },
      data: {
        type: targetType,
        status: nextStatus,
        priority: nextPriority,
        dueDate: nextDueDate,
        startAt: nextStartAt,
        endAt: nextEndAt,
        url: nextUrl,
        ...(targetType !== ObjectType.TASK && { estimatedMinutes: null }),
        recurrence: Prisma.DbNull,
        recurrenceSpawned: false,
      },
    });

    return this.findOne(userId, id);
  }

  /** Các việc chưa xong đang chờ `taskId` (DEPENDS_ON) mà hạn của chúng sớm hơn hoặc bằng hạn mới của `taskId`. */
  async findDelayConflicts(userId: string, taskId: string, newDue: Date) {
    const rels = await this.prisma.objectRelation.findMany({
      where: {
        relationType: 'DEPENDS_ON',
        toObjectId: taskId,
        fromObject: {
          userId,
          type: ObjectType.TASK,
          lifecycle: ObjectLifecycle.ACTIVE,
          deletedAt: null,
          status: { notIn: [TaskStatus.DONE, TaskStatus.CANCELLED] },
          dueDate: { not: null, lte: newDue },
        },
      },
      select: { fromObject: { select: { id: true, title: true, dueDate: true } } },
    });
    return rels.map((r) => r.fromObject);
  }

  /** Luật lặp chỉ dùng cho Task (cần hạn chót) và Event (cần giờ bắt đầu). */
  private assertRecurrenceAllowed(type: ObjectType, rule: unknown, date: unknown) {
    if (!rule) return;
    if (type !== ObjectType.TASK && type !== ObjectType.EVENT) {
      throw new BadRequestException('Chỉ công việc và sự kiện mới lặp lại được');
    }
    if (!date) {
      throw new BadRequestException(
        type === ObjectType.TASK ? 'Cần đặt hạn chót để lặp lại công việc' : 'Cần đặt giờ bắt đầu để lặp lại sự kiện',
      );
    }
  }

  async emptyTrash(userId: string) {
    const { count } = await this.prisma.object.deleteMany({
      where: {
        userId,
        lifecycle: ObjectLifecycle.TRASH,
      },
    });
    return { message: `Đã dọn sạch ${count} mục trong Thùng rác`, count };
  }
}
