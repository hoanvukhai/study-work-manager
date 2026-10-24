import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { localDateKeyDaysAgo, startOfLocalDay } from '../common/timezone';

/**
 * QUY TẮC QUYỀN RIÊNG TƯ: Admin quản lý HỆ THỐNG, không đọc NỘI DUNG của người dùng.
 * Mọi hàm ở đây chỉ được trả thông tin tài khoản và các con số tổng hợp — tuyệt đối không trả
 * tiêu đề / mô tả / URL / metadata của Object, tên hay mô tả Space, nội dung thông báo.
 * (Có test kiểm tra điều này trong test/admin.e2e-spec.ts.)
 */
@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async listUsers(search?: string, page = 1, pageSize = 20) {
    const where: Prisma.UserWhereInput = search?.trim()
      ? {
          OR: [
            { email: { contains: search.trim(), mode: 'insensitive' } },
            { fullName: { contains: search.trim(), mode: 'insensitive' } },
          ],
        }
      : {};

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          createdAt: true,
          lastLoginAt: true,
          lockedAt: true,
          _count: { select: { spaces: true, objects: true } },
        },
      }),
    ]);

    return {
      total,
      page,
      pageSize,
      items: users.map((u) => ({
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        role: u.role,
        createdAt: u.createdAt,
        lastLoginAt: u.lastLoginAt,
        lockedAt: u.lockedAt,
        spacesCount: u._count.spaces,
        objectsCount: u._count.objects,
      })),
    };
  }

  async setLocked(adminId: string, targetId: string, locked: boolean) {
    if (locked && adminId === targetId) {
      throw new BadRequestException('Bạn không thể tự khoá tài khoản của chính mình');
    }
    const target = await this.prisma.user.findUnique({ where: { id: targetId }, select: { id: true, email: true, role: true, lockedAt: true } });
    if (!target) throw new NotFoundException('Không tìm thấy tài khoản');
    if (locked && target.role === Role.ADMIN) {
      throw new BadRequestException('Không thể khoá tài khoản quản trị viên khác');
    }

    await this.prisma.user.update({ where: { id: targetId }, data: { lockedAt: locked ? new Date() : null } });
    await this.audit(adminId, locked ? 'LOCK_USER' : 'UNLOCK_USER', targetId, target.email);
    return { id: targetId, locked };
  }

  async getStats(now: Date = new Date()) {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);

    const [totalUsers, activeUsers7d, lockedUsers, spacesTotal, flashcardsTotal, byType] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { lastLoginAt: { gte: weekAgo } } }),
      this.prisma.user.count({ where: { lockedAt: { not: null } } }),
      this.prisma.space.count(),
      this.prisma.flashcard.count(),
      this.prisma.object.groupBy({ by: ['type'], _count: { _all: true }, where: { deletedAt: null } }),
    ]);

    const since = startOfLocalDay(new Date(now.getTime() - 13 * 24 * 3600 * 1000));
    const [newUsersByDay, newObjectsByDay] = await Promise.all([
      this.dailyCounts('users', since),
      this.dailyCounts('objects', since),
    ]);

    const days = Array.from({ length: 14 }, (_, i) => localDateKeyDaysAgo(now, 13 - i));
    return {
      totalUsers,
      activeUsers7d,
      lockedUsers,
      spacesTotal,
      flashcardsTotal,
      objectsByType: Object.fromEntries(byType.map((b) => [b.type, b._count._all])),
      last14Days: days.map((date) => ({
        date,
        newUsers: newUsersByDay.get(date) ?? 0,
        newObjects: newObjectsByDay.get(date) ?? 0,
      })),
    };
  }

  async broadcast(adminId: string, title: string, message: string) {
    const recipients = await this.notifications.broadcast(title.trim(), message.trim(), randomUUID());
    await this.audit(adminId, 'BROADCAST', null, `${recipients} người nhận`);
    return { recipients };
  }

  async listAuditLogs(limit = 50) {
    const logs = await this.prisma.adminAuditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { id: true, action: true, detail: true, createdAt: true, admin: { select: { email: true } }, target: { select: { email: true } } },
    });
    return logs.map((l) => ({
      id: l.id,
      action: l.action,
      detail: l.detail,
      createdAt: l.createdAt,
      adminEmail: l.admin.email,
      targetEmail: l.target?.email ?? null,
    }));
  }

  // ---- nội bộ ----

  /** Đếm số bản ghi tạo mới theo ngày (giờ Việt Nam). Tên bảng cố định, không nhận từ người dùng. */
  private async dailyCounts(table: 'users' | 'objects', since: Date): Promise<Map<string, number>> {
    const rows = await this.prisma.$queryRawUnsafe<{ d: string; c: bigint }[]>(
      `SELECT to_char(created_at AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD') AS d, COUNT(*)::bigint AS c
       FROM ${table} WHERE created_at >= $1 GROUP BY 1`,
      since,
    );
    return new Map(rows.map((r) => [r.d, Number(r.c)]));
  }

  private async audit(adminId: string, action: string, targetId: string | null, detail: string) {
    this.logger.log(`[admin ${adminId}] ${action} ${targetId ?? ''} ${detail}`);
    await this.prisma.adminAuditLog.create({ data: { adminId, action, targetUserId: targetId, detail } });
  }
}
