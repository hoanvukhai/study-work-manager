import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SpacesService } from './spaces.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SpacesService (Unit Tests)', () => {
  let service: SpacesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    space: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpacesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<SpacesService>(SpacesService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('1. Nên tạo Space độc lập không có parentId (QD-02, triệt tiêu SEC-01)', async () => {
      const userId = 'user-uuid-1';
      const dto = {
        name: 'Đồ án tốt nghiệp',
        description: 'Mô tả',
        icon: '🎓',
        color: '#1a73e8',
        settings: { enableKanban: true },
      };

      const createdSpace = {
        id: 'space-uuid-1',
        userId,
        ...dto,
        archivedAt: null,
      };

      mockPrismaService.space.create.mockResolvedValue(createdSpace);

      const result = await service.create(userId, dto);

      expect(mockPrismaService.space.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId,
          name: 'Đồ án tốt nghiệp',
          settings: { enableKanban: true },
        }),
      });
      expect(result).toEqual(createdSpace);
    });
  });

  describe('findAll', () => {
    it('2. Mặc định chỉ lấy các Space chưa lưu trữ (archivedAt = null) (QD-04)', async () => {
      const userId = 'user-uuid-1';
      mockPrismaService.space.findMany.mockResolvedValue([]);

      await service.findAll(userId, false);

      expect(mockPrismaService.space.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          archivedAt: null,
        },
        orderBy: { createdAt: 'asc' },
        include: {
          _count: { select: { spaceObjects: true } },
        },
      });
    });
  });

  describe('remove', () => {
    it('3. Xoá Space chỉ xoá bảng Space (Object bên trong được an toàn) (QD-04)', async () => {
      const userId = 'user-uuid-1';
      const spaceId = 'space-uuid-1';

      mockPrismaService.space.findFirst.mockResolvedValue({ id: spaceId, userId });
      mockPrismaService.space.delete.mockResolvedValue({ id: spaceId });

      const result = await service.remove(userId, spaceId);

      expect(mockPrismaService.space.delete).toHaveBeenCalledWith({
        where: { id: spaceId },
      });
      expect(result.message).toContain('Đã xoá Không gian thành công');
    });
  });
});
