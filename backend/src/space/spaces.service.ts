import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';

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
        settings: dto.settings ?? {},
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

  async update(userId: string, id: string, dto: UpdateSpaceDto) {
    await this.findOne(userId, id);

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
        ...(dto.settings !== undefined && { settings: dto.settings }),
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
