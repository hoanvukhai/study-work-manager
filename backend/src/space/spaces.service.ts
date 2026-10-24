import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ObjectLifecycle, ObjectType, TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { UpdatePlacementDto } from './dto/placement.dto';

/** Công cụ bật/tắt theo từng Không gian (QD-03). Khoá lạ bị bỏ, giá trị không phải boolean bị bỏ. */
export const SPACE_TOOL_KEYS = ['enableKanban', 'enableCalendar', 'enableProgress'] as const;

export function sanitizeSettings(input: unknown, current: unknown = {}): Record<string, boolean> {
  const base = current && typeof current === 'object' ? (current as Record<string, unknown>) : {};
  const next = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  const out: Record<string, boolean> = {};
  for (const key of SPACE_TOOL_KEYS) {
    const v = key in next ? next[key] : base[key];
    if (typeof v === 'boolean') out[key] = v;
  }
  return out;
}

@Injectable()
export class SpacesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateSpaceDto) {
    return this.prisma.space.create({
      data: {
        userId,
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        icon: dto.icon ?? '📁',
        color: dto.color ?? '#6366f1',
        settings: sanitizeSettings(dto.settings),
        goal: dto.goal?.trim() || null,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      },
    });
  }

  async findAll(userId: string, includeArchived = false) {
    return this.prisma.space.findMany({
      where: {
        userId,
        archivedAt: includeArchived ? undefined : null,
      },
      orderBy: { createdAt: 'asc' },
      include: {
        _count: { select: { spaceObjects: true } },
      },
    });
  }

  async findOne(userId: string, id: string) {
    const space = await this.prisma.space.findFirst({
      where: { id, userId },
      include: {
        _count: { select: { spaceObjects: true } },
      },
    });
    if (!space) throw new NotFoundException('Không tìm thấy Không gian yêu cầu');
    return space;
  }

  /** Chi tiết Không gian kèm tiến độ: số Task đã xong / tổng số Task (bỏ việc đã huỷ, mục trong Thùng rác). */
  async getWithProgress(userId: string, id: string) {
    const space = await this.findOne(userId, id);
    const taskWhere = {
      userId,
      type: ObjectType.TASK,
      lifecycle: ObjectLifecycle.ACTIVE,
      deletedAt: null,
      status: { not: TaskStatus.CANCELLED },
      spaceObjects: { some: { spaceId: id } },
    };
    const [total, done] = await Promise.all([
      this.prisma.object.count({ where: taskWhere }),
      this.prisma.object.count({ where: { ...taskWhere, status: TaskStatus.DONE } }),
    ]);
    return { ...space, progress: { done, total } };
  }

  /** Ghim / đặt vị trí một mục trong một Không gian. */
  async updatePlacement(userId: string, spaceId: string, objectId: string, dto: UpdatePlacementDto) {
    await this.findOne(userId, spaceId);
    const placement = await this.prisma.spaceObject.findFirst({
      where: { spaceId, objectId, object: { userId } },
    });
    if (!placement) throw new NotFoundException('Mục không nằm trong Không gian này');
    return this.prisma.spaceObject.update({
      where: { spaceId_objectId: { spaceId, objectId } },
      data: {
        ...(dto.isPinned !== undefined && { isPinned: dto.isPinned }),
        ...(dto.position !== undefined && { position: dto.position }),
      },
      select: { spaceId: true, objectId: true, isPinned: true, position: true },
    });
  }

  /** Đặt lại thứ tự: các mục trong danh sách nhận vị trí 0..n-1 theo đúng thứ tự gửi lên. */
  async reorder(userId: string, spaceId: string, objectIds: string[]) {
    await this.findOne(userId, spaceId);
    const placements = await this.prisma.spaceObject.findMany({
      where: { spaceId, objectId: { in: objectIds }, object: { userId } },
      select: { objectId: true },
    });
    if (placements.length !== objectIds.length) {
      throw new BadRequestException('Danh sách có mục không thuộc Không gian này');
    }
    await this.prisma.$transaction(
      objectIds.map((objectId, position) =>
        this.prisma.spaceObject.update({ where: { spaceId_objectId: { spaceId, objectId } }, data: { position } }),
      ),
    );
    return { updated: objectIds.length };
  }

  async update(userId: string, id: string, dto: UpdateSpaceDto) {
    const space = await this.findOne(userId, id);

    let archivedAt: Date | null | undefined = undefined;
    if (dto.isArchived !== undefined) {
      archivedAt = dto.isArchived ? new Date() : null;
    }

    return this.prisma.space.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.description !== undefined && { description: dto.description?.trim() || null }),
        ...(dto.icon !== undefined && { icon: dto.icon }),
        ...(dto.color !== undefined && { color: dto.color }),
        ...(dto.settings !== undefined && { settings: sanitizeSettings(dto.settings, space.settings) }),
        ...(dto.goal !== undefined && { goal: dto.goal?.trim() || null }),
        ...(dto.dueDate !== undefined && { dueDate: dto.dueDate ? new Date(dto.dueDate) : null }),
        ...(archivedAt !== undefined && { archivedAt }),
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    // QD-04: Xoá Space chỉ gỡ Object ra khỏi Space (thông qua CASCADE của space_objects), Object không bị xoá
    await this.prisma.space.delete({ where: { id } });
    return { message: 'Đã xoá Không gian thành công. Các mục bên trong vẫn được lưu giữ an toàn.' };
  }
}
