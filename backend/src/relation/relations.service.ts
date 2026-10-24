import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRelationDto } from './dto/create-relation.dto';
import { ObjectLifecycle } from '@prisma/client';

const objectSelect = {
  id: true,
  type: true,
  title: true,
  status: true,
  priority: true,
  description: true,
  dueDate: true,
  startAt: true,
  endAt: true,
  lifecycle: true,
};

@Injectable()
export class RelationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateRelationDto) {
    if (dto.fromObjectId === dto.toObjectId) {
      throw new BadRequestException('Không thể liên kết một mục với chính nó');
    }

    const [fromObject, toObject] = await Promise.all([
      this.prisma.object.findFirst({ where: { id: dto.fromObjectId, userId } }),
      this.prisma.object.findFirst({ where: { id: dto.toObjectId, userId } }),
    ]);

    if (!fromObject) throw new NotFoundException('Không tìm thấy đối tượng nguồn');
    if (!toObject) throw new NotFoundException('Không tìm thấy đối tượng đích');

    // QD-09: Không cho phép liên kết với mục trong Thùng rác
    if (fromObject.lifecycle === ObjectLifecycle.TRASH || toObject.lifecycle === ObjectLifecycle.TRASH) {
      throw new BadRequestException('Không thể liên kết với đối tượng đang nằm trong Thùng rác');
    }

    const existing = await this.prisma.objectRelation.findUnique({
      where: {
        fromObjectId_toObjectId_relationType: {
          fromObjectId: dto.fromObjectId,
          toObjectId: dto.toObjectId,
          relationType: dto.relationType,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Mối quan hệ liên kết này đã tồn tại');
    }

    return this.prisma.objectRelation.create({
      data: {
        fromObjectId: dto.fromObjectId,
        toObjectId: dto.toObjectId,
        relationType: dto.relationType,
      },
      include: {
        fromObject: { select: objectSelect },
        toObject: { select: objectSelect },
      },
    });
  }

  async findByObjectId(userId: string, objectId: string) {
    const object = await this.prisma.object.findFirst({
      where: { id: objectId, userId },
    });
    if (!object) throw new NotFoundException('Không tìm thấy đối tượng');

    // BUG-11: Ẩn các đối tượng đang nằm trong Thùng rác khỏi danh sách liên kết
    const [outgoing, incoming] = await Promise.all([
      this.prisma.objectRelation.findMany({
        where: {
          fromObjectId: objectId,
          toObject: { lifecycle: { not: ObjectLifecycle.TRASH }, deletedAt: null },
        },
        include: { toObject: { select: objectSelect } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.objectRelation.findMany({
        where: {
          toObjectId: objectId,
          fromObject: { lifecycle: { not: ObjectLifecycle.TRASH }, deletedAt: null },
        },
        include: { fromObject: { select: objectSelect } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      objectId,
      outgoing,
      incoming,
    };
  }

  async remove(userId: string, id: string) {
    const relation = await this.prisma.objectRelation.findFirst({
      where: {
        id,
        OR: [
          { fromObject: { userId } },
          { toObject: { userId } },
        ],
      },
    });

    if (!relation) {
      throw new NotFoundException('Không tìm thấy mối liên kết này');
    }

    await this.prisma.objectRelation.delete({ where: { id } });
    return { message: 'Đã xoá liên kết thành công' };
  }
}
