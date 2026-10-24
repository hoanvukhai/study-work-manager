import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ObjectLifecycle, ObjectType, TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { localDateKeyDaysAgo, startOfLocalDay, toLocalDateKey } from '../common/timezone';
import { computeStreak, parseCards } from './cards';
import { Grade, previewMinutes, reviewCard } from './sm2';

/** Note liên quan tới việc có hạn trong khoảng này thì được ưu tiên ôn trước. */
const CONTEXT_WINDOW_DAYS = 3;
const DAY = 24 * 3600 * 1000;

@Injectable()
export class StudyService {
  constructor(private readonly prisma: PrismaService) {}

  /** Đồng bộ thẻ từ nội dung Note: thêm thẻ mới, cập nhật đáp án, xoá thẻ không còn trong nội dung. */
  async syncCards(userId: string, objectId: string) {
    const note = await this.prisma.object.findFirst({ where: { id: objectId, userId } });
    if (!note) throw new NotFoundException('Không tìm thấy ghi chú');
    if (note.type !== ObjectType.NOTE) {
      throw new BadRequestException('Chỉ tạo được thẻ ôn tập từ Ghi chú (Note)');
    }

    const parsed = parseCards(note.description);
    const existing = await this.prisma.flashcard.findMany({ where: { objectId, userId } });
    const existingByFront = new Map(existing.map((c) => [c.front, c]));
    const wanted = new Set(parsed.map((p) => p.front));

    const toCreate = parsed.filter((p) => !existingByFront.has(p.front));
    const toUpdate = parsed.filter((p) => {
      const c = existingByFront.get(p.front);
      return c && c.back !== p.back;
    });
    const toRemove = existing.filter((c) => !wanted.has(c.front));

    await this.prisma.$transaction([
      ...toCreate.map((p) => this.prisma.flashcard.create({ data: { userId, objectId, front: p.front, back: p.back } })),
      ...toUpdate.map((p) =>
        this.prisma.flashcard.update({ where: { id: existingByFront.get(p.front)!.id }, data: { back: p.back } }),
      ),
      ...(toRemove.length
        ? [this.prisma.flashcard.deleteMany({ where: { id: { in: toRemove.map((c) => c.id) }, userId } })]
        : []),
    ]);

    return {
      created: toCreate.length,
      updated: toUpdate.length,
      removed: toRemove.length,
      total: parsed.length,
    };
  }

  async listCardsOfNote(userId: string, objectId: string) {
    const note = await this.prisma.object.findFirst({ where: { id: objectId, userId }, select: { id: true } });
    if (!note) throw new NotFoundException('Không tìm thấy ghi chú');
    return this.prisma.flashcard.findMany({
      where: { objectId, userId },
      orderBy: { createdAt: 'asc' },
      select: { id: true, front: true, back: true, dueAt: true, intervalDays: true, repetitions: true },
    });
  }

  /**
   * Thẻ đến hạn ôn. Thẻ của Note đang liên kết với việc sắp đến hạn (trong 3 ngày) được xếp trước —
   * ví dụ sắp làm "Viết module Auth" thì ôn ghi chú JWT trước.
   */
  async getDue(userId: string, limit = 20, now: Date = new Date()) {
    const cards = await this.prisma.flashcard.findMany({
      where: {
        userId,
        dueAt: { lte: now },
        object: { lifecycle: ObjectLifecycle.ACTIVE, deletedAt: null },
      },
      orderBy: { dueAt: 'asc' },
      take: 200,
      include: { object: { select: { id: true, title: true } } },
    });

    const contextByNote = await this.getContextNotes(userId, now);

    const decorated = cards.map((c) => ({
      id: c.id,
      front: c.front,
      back: c.back,
      noteId: c.object.id,
      noteTitle: c.object.title,
      isNew: c.repetitions === 0 && !c.lastReviewedAt,
      contextReason: contextByNote.has(c.objectId)
        ? `Liên quan tới việc "${contextByNote.get(c.objectId)}" sắp đến hạn`
        : null,
      previewMinutes: previewMinutes(c, now),
      dueAt: c.dueAt,
    }));

    decorated.sort((a, b) => {
      if (!!a.contextReason !== !!b.contextReason) return a.contextReason ? -1 : 1;
      return a.dueAt.getTime() - b.dueAt.getTime();
    });

    const totalCards = await this.prisma.flashcard.count({ where: { userId } });
    return { dueCount: cards.length, totalCards, cards: decorated.slice(0, limit) };
  }

  async review(userId: string, cardId: string, grade: Grade, now: Date = new Date()) {
    const card = await this.prisma.flashcard.findFirst({ where: { id: cardId, userId } });
    if (!card) throw new NotFoundException('Không tìm thấy thẻ');

    const next = reviewCard(card, grade, now);
    const [updated] = await this.prisma.$transaction([
      this.prisma.flashcard.update({
        where: { id: cardId },
        data: {
          easeFactor: next.easeFactor,
          intervalDays: next.intervalDays,
          repetitions: next.repetitions,
          dueAt: next.dueAt,
          lastReviewedAt: now,
        },
      }),
      this.prisma.flashcardReview.create({
        data: {
          cardId,
          userId,
          grade,
          intervalAfter: next.intervalDays,
          easeAfter: next.easeFactor,
          reviewedAt: now,
        },
      }),
    ]);

    return {
      id: updated.id,
      intervalDays: updated.intervalDays,
      easeFactor: updated.easeFactor,
      repetitions: updated.repetitions,
      dueAt: updated.dueAt,
    };
  }

  async createSession(userId: string, minutes: number, objectId?: string) {
    if (objectId) {
      const obj = await this.prisma.object.findFirst({ where: { id: objectId, userId }, select: { id: true } });
      if (!obj) throw new NotFoundException('Không tìm thấy mục đã chọn');
    }
    return this.prisma.studySession.create({
      data: { userId, minutes, objectId: objectId ?? null },
      select: { id: true, minutes: true, objectId: true, createdAt: true },
    });
  }

  async getStats(userId: string, now: Date = new Date()) {
    const since = startOfLocalDay(new Date(now.getTime() - 59 * DAY));

    const [reviews, sessions, dueNow, totalCards] = await Promise.all([
      this.prisma.flashcardReview.findMany({ where: { userId, reviewedAt: { gte: since } }, select: { reviewedAt: true } }),
      this.prisma.studySession.findMany({ where: { userId, createdAt: { gte: since } }, select: { createdAt: true, minutes: true } }),
      this.prisma.flashcard.count({
        where: { userId, dueAt: { lte: now }, object: { lifecycle: ObjectLifecycle.ACTIVE, deletedAt: null } },
      }),
      this.prisma.flashcard.count({ where: { userId } }),
    ]);

    const reviewsByDay = new Map<string, number>();
    const minutesByDay = new Map<string, number>();
    for (const r of reviews) {
      const k = toLocalDateKey(r.reviewedAt);
      reviewsByDay.set(k, (reviewsByDay.get(k) ?? 0) + 1);
    }
    for (const s of sessions) {
      const k = toLocalDateKey(s.createdAt);
      minutesByDay.set(k, (minutesByDay.get(k) ?? 0) + s.minutes);
    }

    const today = toLocalDateKey(now);
    const activeDays = new Set<string>([...reviewsByDay.keys(), ...minutesByDay.keys()]);

    const last7 = Array.from({ length: 7 }, (_, i) => localDateKeyDaysAgo(now, 6 - i)).map((date) => ({
      date,
      reviews: reviewsByDay.get(date) ?? 0,
      minutes: minutesByDay.get(date) ?? 0,
    }));

    return {
      dueNow,
      totalCards,
      reviewedToday: reviewsByDay.get(today) ?? 0,
      minutesToday: minutesByDay.get(today) ?? 0,
      minutesWeek: last7.reduce((sum, d) => sum + d.minutes, 0),
      streakDays: computeStreak(activeDays, today),
      last7Days: last7,
    };
  }

  /** noteId → tiêu đề việc sắp đến hạn đang liên kết với note đó. */
  private async getContextNotes(userId: string, now: Date): Promise<Map<string, string>> {
    const soon = new Date(now.getTime() + CONTEXT_WINDOW_DAYS * DAY);
    const openSoonTask = {
      type: ObjectType.TASK,
      userId,
      lifecycle: ObjectLifecycle.ACTIVE,
      deletedAt: null,
      status: { notIn: [TaskStatus.DONE, TaskStatus.CANCELLED] },
      dueDate: { lte: soon },
    };
    const note = { type: ObjectType.NOTE, userId, lifecycle: ObjectLifecycle.ACTIVE, deletedAt: null };

    const rels = await this.prisma.objectRelation.findMany({
      where: {
        OR: [
          { fromObject: note, toObject: openSoonTask },
          { fromObject: openSoonTask, toObject: note },
        ],
      },
      select: {
        fromObject: { select: { id: true, type: true, title: true } },
        toObject: { select: { id: true, type: true, title: true } },
      },
    });

    const map = new Map<string, string>();
    for (const r of rels) {
      const noteSide = r.fromObject.type === ObjectType.NOTE ? r.fromObject : r.toObject;
      const taskSide = r.fromObject.type === ObjectType.TASK ? r.fromObject : r.toObject;
      if (!map.has(noteSide.id)) map.set(noteSide.id, taskSide.title);
    }
    return map;
  }
}
