import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ObjectsService } from './objects.service';
import { PrismaService } from '../prisma/prisma.service';
import { KnowledgeService } from '../knowledge/knowledge.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RecurrenceService } from '../recurrence/recurrence.service';
import { ObjectType, TaskStatus, Priority, ObjectLifecycle } from '@prisma/client';

describe('ObjectsService (Unit Tests)', () => {
  let service: ObjectsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    space: {
      findFirst: jest.fn(),
    },
    object: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    spaceObject: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ObjectsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: KnowledgeService, useValue: { syncMentions: jest.fn() } },
        { provide: RecurrenceService, useValue: { spawnNext: jest.fn() } },
        { provide: NotificationsService, useValue: { onTaskFinished: jest.fn(), clearPendingReminders: jest.fn() } },
      ],
    }).compile();

    service = module.get<ObjectsService>(ObjectsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const userId = 'user-uuid-1';

    it('1. Nên ném lỗi BadRequestException nếu tạo EVENT có endAt <= startAt (SEC-06, QD-07)', async () => {
      const invalidEventDto = {
        type: ObjectType.EVENT,
        title: 'Buổi họp lỗi thời gian',
        startAt: '2026-10-15T10:00:00.000Z',
        endAt: '2026-10-15T09:00:00.000Z', // Kết thúc trước bắt đầu
      };

      await expect(service.create(userId, invalidEventDto)).rejects.toThrow(BadRequestException);
    });

    it('2. Nên ném lỗi BadRequestException nếu tạo REFERENCE có URL sai định dạng (SEC-06, QD-07)', async () => {
      const invalidRefDto = {
        type: ObjectType.REFERENCE,
        title: 'Tài liệu không có link hợp lệ',
        url: 'invalid-url-string',
      };

      await expect(service.create(userId, invalidRefDto)).rejects.toThrow(BadRequestException);
    });

    it('3. Nên tạo thành công TASK với status mặc định là TODO và priority là MEDIUM (BUG-07 Transaction)', async () => {
      const taskDto = {
        type: ObjectType.TASK,
        title: 'Nhiệm vụ kiểm thử',
        description: 'Mô tả chi tiết',
      };

      const createdObj = {
        id: 'obj-uuid-1',
        userId,
        ...taskDto,
        status: TaskStatus.TODO,
        priority: Priority.MEDIUM,
        lifecycle: ObjectLifecycle.ACTIVE,
      };

      mockPrismaService.object.create.mockResolvedValue(createdObj);
      mockPrismaService.object.findFirst.mockResolvedValue(createdObj);

      const result = await service.create(userId, taskDto);

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(mockPrismaService.object.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId,
          type: ObjectType.TASK,
          title: 'Nhiệm vụ kiểm thử',
          status: TaskStatus.TODO,
          priority: Priority.MEDIUM,
          lifecycle: ObjectLifecycle.ACTIVE,
        }),
      });
      expect(result).toEqual(createdObj);
    });
  });

  describe('updateLifecycle', () => {
    const userId = 'user-uuid-1';
    const objectId = 'obj-uuid-1';

    it('4. Nên cập nhật vòng đời sang TRASH và ghi nhận deletedAt (QD-05)', async () => {
      mockPrismaService.object.findFirst.mockResolvedValue({ id: objectId, userId });
      mockPrismaService.object.update.mockResolvedValue({
        id: objectId,
        lifecycle: ObjectLifecycle.TRASH,
        deletedAt: new Date(),
      });

      await service.updateLifecycle(userId, objectId, 'TRASH');

      expect(mockPrismaService.object.update).toHaveBeenCalledWith({
        where: { id: objectId },
        data: expect.objectContaining({
          lifecycle: ObjectLifecycle.TRASH,
          deletedAt: expect.any(Date),
        }),
      });
    });

    it('5. Nên cập nhật vòng đời sang ARCHIVED và ghi nhận archivedAt (QD-05)', async () => {
      mockPrismaService.object.findFirst.mockResolvedValue({ id: objectId, userId });
      mockPrismaService.object.update.mockResolvedValue({
        id: objectId,
        lifecycle: ObjectLifecycle.ARCHIVED,
        archivedAt: new Date(),
      });

      await service.updateLifecycle(userId, objectId, 'ARCHIVE');

      expect(mockPrismaService.object.update).toHaveBeenCalledWith({
        where: { id: objectId },
        data: expect.objectContaining({
          lifecycle: ObjectLifecycle.ARCHIVED,
          archivedAt: expect.any(Date),
          deletedAt: null,
        }),
      });
    });

    it('6. Nên khôi phục vòng đời về ACTIVE và xoá archivedAt, deletedAt (QD-05)', async () => {
      mockPrismaService.object.findFirst.mockResolvedValue({ id: objectId, userId });
      mockPrismaService.object.update.mockResolvedValue({
        id: objectId,
        lifecycle: ObjectLifecycle.ACTIVE,
        archivedAt: null,
        deletedAt: null,
      });

      await service.updateLifecycle(userId, objectId, 'RESTORE');

      expect(mockPrismaService.object.update).toHaveBeenCalledWith({
        where: { id: objectId },
        data: expect.objectContaining({
          lifecycle: ObjectLifecycle.ACTIVE,
          archivedAt: null,
          deletedAt: null,
        }),
      });
    });
  });

  describe('update', () => {
    const userId = 'user-uuid-1';
    const objectId = 'obj-uuid-1';

    it('7. Không cho phép cập nhật nếu sự kiện sửa endAt <= startAt (SEC-06)', async () => {
      mockPrismaService.object.findFirst.mockResolvedValue({
        id: objectId,
        userId,
        type: ObjectType.EVENT,
        startAt: new Date('2026-10-15T10:00:00.000Z'),
        endAt: new Date('2026-10-15T12:00:00.000Z'),
      });

      await expect(
        service.update(userId, objectId, {
          endAt: '2026-10-15T09:00:00.000Z',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('8. Chuyển loại Note sang Task thiết lập status TODO và priority MEDIUM (QD-06)', async () => {
      mockPrismaService.object.findFirst.mockResolvedValue({
        id: objectId,
        userId,
        type: ObjectType.NOTE,
        title: 'Ghi chú ý tưởng',
      });
      mockPrismaService.object.update.mockResolvedValue({
        id: objectId,
        type: ObjectType.TASK,
        status: TaskStatus.TODO,
        priority: Priority.MEDIUM,
      });

      await service.convertType(userId, objectId, ObjectType.TASK);

      expect(mockPrismaService.object.update).toHaveBeenCalledWith({
        where: { id: objectId },
        data: expect.objectContaining({
          type: ObjectType.TASK,
          status: TaskStatus.TODO,
          priority: Priority.MEDIUM,
        }),
      });
    });

    it('9. Dọn sạch Thùng rác xóa vĩnh viễn các đối tượng TRASH của user (BUG-03)', async () => {
      mockPrismaService.object.deleteMany.mockResolvedValue({ count: 5 });

      const res = await service.emptyTrash(userId);

      expect(mockPrismaService.object.deleteMany).toHaveBeenCalledWith({
        where: {
          userId,
          lifecycle: ObjectLifecycle.TRASH,
        },
      });
      expect(res.count).toBe(5);
    });
  });
});
