import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateObjectDto } from './dto/create-object.dto';
import { UpdateObjectDto } from './dto/update-object.dto';
import { QueryObjectsDto } from './dto/query-objects.dto';
import { KnowledgeService } from '../knowledge/knowledge.service';
import { ObjectLifecycle, ObjectType, TaskStatus, Priority } from '@prisma/client';

@Injectable()
export class ObjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly knowledge: KnowledgeService,
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

  async findAll(userId: string, query: QueryObjectsDto) {
    const where: Prisma.ObjectWhereInput = {
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

    return this.prisma.object.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
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
      },
    });

    // Nội dung đổi → đồng bộ liên kết tự động từ [[Tiêu đề]]
    if (dto.description !== undefined) {
      await this.knowledge.syncMentions(userId, id, dto.description?.trim() || null);
    }

    return this.findOne(userId, id);
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
      },
    });

    return this.findOne(userId, id);
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
