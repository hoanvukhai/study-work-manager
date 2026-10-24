import { Injectable } from '@nestjs/common';
import { ObjectLifecycle, Prisma, RelationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { parseMentions } from './mentions';

/** Số nút tối đa trả về cho bản đồ (giữ giao diện mượt). */
export const MAX_GRAPH_NODES = 400;

@Injectable()
export class KnowledgeService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Đồng bộ liên kết tự động từ các nhắc `[[Tiêu đề]]` trong nội dung của một mục:
   * tạo liên kết RELATES_TO tới mục trùng tiêu đề, xoá liên kết tự động không còn được nhắc.
   * Liên kết do người dùng tạo tay (auto = false) không bao giờ bị đụng tới.
   */
  async syncMentions(userId: string, objectId: string, description: string | null | undefined) {
    const titles = parseMentions(description);

    let targetIds: string[] = [];
    if (titles.length > 0) {
      const found = await this.prisma.object.findMany({
        where: {
          userId,
          id: { not: objectId },
          lifecycle: { not: ObjectLifecycle.TRASH },
          deletedAt: null,
          OR: titles.map((t) => ({ title: { equals: t, mode: 'insensitive' as Prisma.QueryMode } })),
        },
        select: { id: true, title: true },
        orderBy: { updatedAt: 'desc' },
      });
      // Trùng tiêu đề: lấy mục mới cập nhật nhất cho mỗi tiêu đề
      const byTitle = new Map<string, string>();
      for (const o of found) {
        const key = o.title.toLowerCase();
        if (!byTitle.has(key)) byTitle.set(key, o.id);
      }
      targetIds = [...new Set(titles.map((t) => byTitle.get(t.toLowerCase())).filter((x): x is string => !!x))];
    }

    const existingAuto = await this.prisma.objectRelation.findMany({
      where: { fromObjectId: objectId, auto: true, relationType: RelationType.RELATES_TO },
      select: { id: true, toObjectId: true },
    });

    const wanted = new Set(targetIds);
    const toRemove = existingAuto.filter((r) => !wanted.has(r.toObjectId)).map((r) => r.id);
    const alreadyAuto = new Set(existingAuto.map((r) => r.toObjectId));
    const toCreate = targetIds.filter((id) => !alreadyAuto.has(id));

    if (toRemove.length === 0 && toCreate.length === 0) return { created: 0, removed: 0 };

    await this.prisma.$transaction([
      ...(toRemove.length ? [this.prisma.objectRelation.deleteMany({ where: { id: { in: toRemove } } })] : []),
      ...(toCreate.length
        ? [
            this.prisma.objectRelation.createMany({
              data: toCreate.map((toObjectId) => ({
                fromObjectId: objectId,
                toObjectId,
                relationType: RelationType.RELATES_TO,
                auto: true,
              })),
              skipDuplicates: true, // đã có liên kết tay cùng loại thì giữ nguyên bản tay
            }),
          ]
        : []),
    ]);

    return { created: toCreate.length, removed: toRemove.length };
  }

  /** Dữ liệu cho bản đồ tri thức: các mục đang hoạt động và liên kết giữa chúng. */
  async getGraph(userId: string, spaceId?: string) {
    const objects = await this.prisma.object.findMany({
      where: {
        userId,
        lifecycle: ObjectLifecycle.ACTIVE,
        deletedAt: null,
        ...(spaceId && { spaceObjects: { some: { spaceId } } }),
      },
      orderBy: { updatedAt: 'desc' },
      take: MAX_GRAPH_NODES + 1,
      select: {
        id: true,
        type: true,
        title: true,
        status: true,
        spaceObjects: { select: { spaceId: true } },
      },
    });

    const truncated = objects.length > MAX_GRAPH_NODES;
    const nodes = objects.slice(0, MAX_GRAPH_NODES);
    const ids = nodes.map((n) => n.id);

    const relations = ids.length
      ? await this.prisma.objectRelation.findMany({
          where: { fromObjectId: { in: ids }, toObjectId: { in: ids } },
          select: { id: true, fromObjectId: true, toObjectId: true, relationType: true, auto: true },
        })
      : [];

    return {
      truncated,
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        status: n.status,
        spaceIds: n.spaceObjects.map((s) => s.spaceId),
      })),
      edges: relations.map((r) => ({
        id: r.id,
        from: r.fromObjectId,
        to: r.toObjectId,
        relationType: r.relationType,
        auto: r.auto,
      })),
    };
  }
}
