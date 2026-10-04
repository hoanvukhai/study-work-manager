import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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
        name: dto.name,
        description: dto.description,
        icon: dto.icon ?? '📁',
        color: dto.color ?? '#6366f1',
        parentId: dto.parentId ?? null,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.space.findMany({
      where: { userId, isArchived: false },
      orderBy: { createdAt: 'asc' },
      include: {
        children: {
          where: { isArchived: false },
          orderBy: { createdAt: 'asc' },
        },
        _count: { select: { spaceObjects: true } },
      },
    });
  }

  async findOne(userId: string, id: string) {
    const space = await this.prisma.space.findFirst({
      where: { id, userId },
      include: {
        children: { where: { isArchived: false } },
        _count: { select: { spaceObjects: true } },
      },
    });
    if (!space) throw new NotFoundException('Space not found');
    return space;
  }

  async update(userId: string, id: string, dto: UpdateSpaceDto) {
    const space = await this.prisma.space.findFirst({ where: { id, userId } });
    if (!space) throw new NotFoundException('Space not found');

    return this.prisma.space.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.icon !== undefined && { icon: dto.icon }),
        ...(dto.color !== undefined && { color: dto.color }),
        ...(dto.parentId !== undefined && { parentId: dto.parentId }),
        ...(dto.isArchived !== undefined && { isArchived: dto.isArchived }),
      },
    });
  }

  async remove(userId: string, id: string) {
    const space = await this.prisma.space.findFirst({ where: { id, userId } });
    if (!space) throw new NotFoundException('Space not found');
    await this.prisma.space.delete({ where: { id } });
    return { message: 'Space deleted successfully' };
  }
}
