import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export const EXPORT_FORMAT_VERSION = 1;

/** Xuất TOÀN BỘ dữ liệu của chính người dùng (quyền sở hữu và mang dữ liệu đi). Không bao giờ chứa mật khẩu hay token. */
@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}

  async exportData(userId: string) {
    const [user, spaces, objects, spaceObjects, relations, flashcards, reviews, sessions, notifications, settings] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, fullName: true, avatarUrl: true, createdAt: true },
      }),
      this.prisma.space.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
      this.prisma.object.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
      this.prisma.spaceObject.findMany({ where: { space: { userId } } }),
      this.prisma.objectRelation.findMany({ where: { fromObject: { userId } } }),
      this.prisma.flashcard.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
      this.prisma.flashcardReview.findMany({ where: { userId }, orderBy: { reviewedAt: 'asc' } }),
      this.prisma.studySession.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
      this.prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
      this.prisma.notificationSettings.findUnique({ where: { userId } }),
    ]);

    return {
      format: 'study-work-manager-export',
      version: EXPORT_FORMAT_VERSION,
      exportedAt: new Date().toISOString(),
      user,
      counts: {
        spaces: spaces.length,
        objects: objects.length,
        relations: relations.length,
        flashcards: flashcards.length,
      },
      spaces,
      objects,
      placements: spaceObjects,
      relations,
      flashcards,
      flashcardReviews: reviews,
      studySessions: sessions,
      notifications,
      notificationSettings: settings,
    };
  }
}
