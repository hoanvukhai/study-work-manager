import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateObjectDto } from './dto/create-object.dto';
import { UpdateObjectDto } from './dto/update-object.dto';
import { QueryObjectsDto } from './dto/query-objects.dto';
import { ObjectLifecycle, ObjectType, TaskStatus, Priority } from '@prisma/client';

@Injectable()
export class ObjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateObjectDto) {
    if (dto.spaceId) {
      const space = await this.prisma.space.findFirst({
        where: { id: dto.spaceId, userId },
      });
      if (!space) {
        throw new NotFoundException('Không tìm thấy Không gian được chọn');
      }
    }

    const object = await this.prisma.object.create({
      data: {
        userId,
        type: dto.type,
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        status: dto.status ?? TaskStatus.TODO,
        priority: dto.priority ?? Priority.MEDIUM,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        startAt: dto.startAt ? new Date(dto.startAt) : null,
        endAt: dto.endAt ? new Date(dto.endAt) : null,
        url: dto.url?.trim() || null,
        metadata: dto.metadata ?? {},
        lifecycle: ObjectLifecycle.ACTIVE,
      },
    });

    if (dto.spaceId) {
      await this.prisma.spaceObject.create({
        data: {
          spaceId: dto.spaceId,
          objectId: object.id,
        },
      });
    }

    return this.findOne(userId, object.id);
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
    await this.findOne(userId, id);

    await this.prisma.object.update({
      where: { id },
      data: {
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.title !== undefined && { title: dto.title.trim() }),
        ...(dto.description !== undefined && { description: dto.description?.trim() || null }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
        ...(dto.lifecycle !== undefined && { lifecycle: dto.lifecycle }),
        ...(dto.dueDate !== undefined && { dueDate: dto.dueDate ? new Date(dto.dueDate) : null }),
        ...(dto.startAt !== undefined && { startAt: dto.startAt ? new Date(dto.startAt) : null }),
        ...(dto.endAt !== undefined && { endAt: dto.endAt ? new Date(dto.endAt) : null }),
        ...(dto.url !== undefined && { url: dto.url?.trim() || null }),
        ...(dto.metadata !== undefined && { metadata: dto.metadata }),
      },
    });

    return this.findOne(userId, id);
  }

  async updateLifecycle(userId: string, id: string, action: 'ARCHIVE' | 'TRASH' | 'RESTORE') {
    await this.findOne(userId, id);

    let lifecycle: ObjectLifecycle = ObjectLifecycle.ACTIVE;
    let deletedAt: Date | null = null;

    if (action === 'TRASH') {
      lifecycle = ObjectLifecycle.TRASH;
      deletedAt = new Date();
    } else if (action === 'ARCHIVE') {
      lifecycle = ObjectLifecycle.ARCHIVED;
      deletedAt = null;
    } else if (action === 'RESTORE') {
      lifecycle = ObjectLifecycle.ACTIVE;
      deletedAt = null;
    }

    await this.prisma.object.update({
      where: { id },
      data: { lifecycle, deletedAt },
    });

    return this.findOne(userId, id);
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
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
}
