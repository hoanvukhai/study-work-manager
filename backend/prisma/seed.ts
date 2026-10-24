import * as bcrypt from 'bcrypt';
import {
  PrismaClient,
  Role,
  ObjectType,
  TaskStatus,
  Priority,
  ObjectLifecycle,
  RelationType,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding revamped database for study-work-manager...');

  // 1. Tạo User Demo
  const demoPasswordHash = await bcrypt.hash('Password123!', 10);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {
      passwordHash: demoPasswordHash,
      role: Role.USER,
    },
    create: {
      email: 'demo@example.com',
      fullName: 'Vũ Khải Hoàn',
      passwordHash: demoPasswordHash,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hoan',
      role: Role.USER,
    },
  });
  console.log(`[Seed] Demo User: ${demoUser.email} (Mật khẩu: Password123!)`);

  // 2. Tạo User Admin
  const adminPasswordHash = await bcrypt.hash('Admin12345!', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
    create: {
      email: 'admin@example.com',
      fullName: 'Quản Trị Viên Hệ Thống',
      passwordHash: adminPasswordHash,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
      role: Role.ADMIN,
    },
  });
  console.log(`[Seed] Admin User: ${adminUser.email} (Mật khẩu: Admin12345!)`);

  // Dọn dữ liệu mẫu cũ của Demo User để seed chạy lại nhiều lần không bị trùng
  await prisma.notification.deleteMany({ where: { userId: demoUser.id } });
  await prisma.object.deleteMany({ where: { userId: demoUser.id } });
  await prisma.space.deleteMany({ where: { userId: demoUser.id } });

  // 3. Tạo Không gian (Spaces) cho Demo User
  const thesisSpace = await prisma.space.create({
    data: {
      userId: demoUser.id,
      name: 'Đồ án tốt nghiệp',
      icon: '🎓',
      color: '#1a73e8',
      description: 'Hệ thống Quản lý Học tập và Công việc Cá nhân',
      goal: 'Bảo vệ thành công xuất sắc đồ án tốt nghiệp',
      dueDate: new Date(Date.now() + 86400000 * 60), // Hạn 60 ngày tới
      settings: {
        enableKanban: true,
        enableCalendar: true,
        enableProgress: true,
      },
    },
  });

  const freelanceSpace = await prisma.space.create({
    data: {
      userId: demoUser.id,
      name: 'Việc Freelance',
      icon: '💼',
      color: '#f59e0b',
      description: 'Các dự án gia công ngoài giờ',
      goal: 'Bàn giao 2 dự án đúng tiến độ trong quý 4',
      settings: {
        enableKanban: true,
        enableCalendar: false,
      },
    },
  });
  console.log(`[Seed] Đã tạo 2 Không gian: "${thesisSpace.name}", "${freelanceSpace.name}"`);

  // 4. Tạo đầy đủ 4 loại đối tượng (Task, Note, Event, Reference)
  const now = Date.now();

  // (a) NOTE
  const noteThesis = await prisma.object.create({
    data: {
      userId: demoUser.id,
      type: ObjectType.NOTE,
      title: 'Ghi chú góp ý của Thầy Cường',
      description: '- Tập trung vào kiến trúc Hybrid Object\n- Chú ý liên kết chéo giữa Note và Task\n- Giao diện tối giản, trực quan và responsive',
      lifecycle: ObjectLifecycle.ACTIVE,
    },
  });

  // (b) TASK
  const taskApi = await prisma.object.create({
    data: {
      userId: demoUser.id,
      type: ObjectType.TASK,
      title: 'Hoàn thiện bản thiết kế 22 API endpoints',
      description: 'Đặc tả chi tiết Request/Response cho module Object, Space và Relation',
      status: TaskStatus.DONE,
      priority: Priority.HIGH,
      lifecycle: ObjectLifecycle.ACTIVE,
      dueDate: new Date(now + 86400000 * 2),
    },
  });

  const taskSeed = await prisma.object.create({
    data: {
      userId: demoUser.id,
      type: ObjectType.TASK,
      title: 'Khởi tạo Prisma Schema và nạp dữ liệu mẫu',
      description: 'Cấu hình Docker PostgreSQL và kiểm tra kết nối với NestJS',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.URGENT,
      lifecycle: ObjectLifecycle.ACTIVE,
      dueDate: new Date(now + 86400000 * 1),
      estimatedMinutes: 180,
    },
  });

  // Demo Trụ Kế hoạch: việc phụ thuộc + việc con
  const taskModule = await prisma.object.create({
    data: {
      userId: demoUser.id,
      type: ObjectType.TASK,
      title: 'Viết module Space (chờ khởi tạo Prisma xong)',
      status: TaskStatus.TODO,
      priority: Priority.HIGH,
      lifecycle: ObjectLifecycle.ACTIVE,
      dueDate: new Date(now + 86400000 * 4),
      estimatedMinutes: 240,
    },
  });
  const subDocker = await prisma.object.create({
    data: {
      userId: demoUser.id,
      type: ObjectType.TASK,
      title: 'Chạy Docker PostgreSQL',
      status: TaskStatus.DONE,
      priority: Priority.MEDIUM,
      lifecycle: ObjectLifecycle.ACTIVE,
      estimatedMinutes: 30,
    },
  });
  const subMigrate = await prisma.object.create({
    data: {
      userId: demoUser.id,
      type: ObjectType.TASK,
      title: 'Chạy migration và seed',
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      lifecycle: ObjectLifecycle.ACTIVE,
      estimatedMinutes: 45,
    },
  });

  // (c) EVENT
  const meetingEvent = await prisma.object.create({
    data: {
      userId: demoUser.id,
      type: ObjectType.EVENT,
      title: 'Họp báo cáo tiến độ tuần với GVHD',
      description: 'Báo cáo hoàn thành Giai đoạn 0: Dọn nền CSDL và sửa lỗi bảo mật',
      priority: Priority.HIGH,
      startAt: new Date(now + 86400000 * 3), // 3 ngày nữa
      endAt: new Date(now + 86400000 * 3 + 3600000 * 2), // Họp 2 tiếng
      lifecycle: ObjectLifecycle.ACTIVE,
    },
  });

  // (d) REFERENCE
  const refNest = await prisma.object.create({
    data: {
      userId: demoUser.id,
      type: ObjectType.REFERENCE,
      title: 'NestJS & Prisma Documentation',
      description: 'Tài liệu hướng dẫn tích hợp NestJS với Prisma ORM',
      url: 'https://docs.nestjs.com/recipes/prisma',
      lifecycle: ObjectLifecycle.ACTIVE,
    },
  });

  // 5. Gán đối tượng vào các Không gian (SpaceObject)
  // Demo tính năng cốt lõi: 1 Object có thể thuộc NHIỀU Space
  await prisma.spaceObject.createMany({
    data: [
      { spaceId: thesisSpace.id, objectId: noteThesis.id, position: 0, isPinned: true },
      { spaceId: thesisSpace.id, objectId: taskApi.id, position: 1, isPinned: false },
      { spaceId: thesisSpace.id, objectId: taskSeed.id, position: 2, isPinned: true },
      { spaceId: thesisSpace.id, objectId: meetingEvent.id, position: 3, isPinned: false },
      { spaceId: thesisSpace.id, objectId: refNest.id, position: 4, isPinned: false },
      // Đồng thời gán task API và refNest sang cả FreelanceSpace để demo multi-space
      { spaceId: thesisSpace.id, objectId: taskModule.id, position: 5, isPinned: false },
      { spaceId: thesisSpace.id, objectId: subDocker.id, position: 6, isPinned: false },
      { spaceId: thesisSpace.id, objectId: subMigrate.id, position: 7, isPinned: false },
      { spaceId: freelanceSpace.id, objectId: taskApi.id, position: 0, isPinned: false },
      { spaceId: freelanceSpace.id, objectId: refNest.id, position: 1, isPinned: false },
    ],
  });
  console.log('[Seed] Đã gán đối tượng vào Space (bao gồm đối tượng thuộc nhiều Space)');

  // 6. Tạo Liên kết (ObjectRelation)
  await prisma.objectRelation.createMany({
    data: [
      {
        fromObjectId: taskSeed.id,
        toObjectId: noteThesis.id,
        relationType: RelationType.REFERENCES,
      },
      // Việc "viết module Space" phải chờ "khởi tạo Prisma" xong
      { fromObjectId: taskModule.id, toObjectId: taskSeed.id, relationType: RelationType.DEPENDS_ON },
      // Việc cha – việc con
      { fromObjectId: taskSeed.id, toObjectId: subDocker.id, relationType: RelationType.PARENT_OF },
      { fromObjectId: taskSeed.id, toObjectId: subMigrate.id, relationType: RelationType.PARENT_OF },
      {
        fromObjectId: taskApi.id,
        toObjectId: refNest.id,
        relationType: RelationType.REFERENCES,
      },
    ],
  });
  console.log('[Seed] Đã tạo liên kết REFERENCES, DEPENDS_ON và PARENT_OF');

  // 6b. Demo Trụ Học tập: Note có thẻ hỏi–đáp, liên kết với việc sắp đến hạn → được ưu tiên ôn
  const noteJwt = await prisma.object.create({
    data: {
      userId: demoUser.id,
      type: ObjectType.NOTE,
      title: 'Ghi chú JWT & bảo mật',
      description: [
        'Ôn nhanh trước khi viết module Auth (xem thêm [[NestJS & Prisma Documentation]] và [[Ghi chú góp ý của Thầy Cường]]):',
        'JWT gồm mấy phần? :: 3 phần: header, payload, signature',
        'Bcrypt dùng để làm gì? :: Băm một chiều mật khẩu trước khi lưu',
        'Vì sao đăng nhập sai chỉ báo lỗi chung? :: Tránh lộ tài khoản nào tồn tại',
      ].join('\n'),
      lifecycle: ObjectLifecycle.ACTIVE,
    },
  });
  await prisma.spaceObject.create({ data: { spaceId: thesisSpace.id, objectId: noteJwt.id, position: 8 } });
  await prisma.objectRelation.create({
    data: { fromObjectId: taskSeed.id, toObjectId: noteJwt.id, relationType: RelationType.REFERENCES },
  });
  await prisma.flashcard.createMany({
    data: [
      { front: 'JWT gồm mấy phần?', back: '3 phần: header, payload, signature' },
      { front: 'Bcrypt dùng để làm gì?', back: 'Băm một chiều mật khẩu trước khi lưu' },
      { front: 'Vì sao đăng nhập sai chỉ báo lỗi chung?', back: 'Tránh lộ tài khoản nào tồn tại' },
    ].map((c) => ({ ...c, userId: demoUser.id, objectId: noteJwt.id })),
  });
  // Liên kết tự động sinh từ [[ ]] trong nội dung (giống KnowledgeService.syncMentions)
  await prisma.objectRelation.createMany({
    data: [
      { fromObjectId: noteJwt.id, toObjectId: refNest.id, relationType: RelationType.RELATES_TO, auto: true },
      { fromObjectId: noteJwt.id, toObjectId: noteThesis.id, relationType: RelationType.RELATES_TO, auto: true },
    ],
  });
  console.log('[Seed] Đã tạo Note JWT với 3 thẻ ôn tập');

  // 7. Tạo Thông báo mẫu
  await prisma.notification.create({
    data: {
      userId: demoUser.id,
      objectId: taskSeed.id,
      type: 'DEADLINE_SOON',
      title: 'Nhắc nhở hạn chót',
      message: 'Nhiệm vụ "Khởi tạo Prisma Schema và nạp dữ liệu mẫu" sắp đến hạn trong 24 giờ tới.',
      dedupeKey: `DEADLINE_SOON:${taskSeed.id}:seed`,
    },
  });
  console.log('[Seed] Đã tạo thông báo nhắc hạn chót mẫu');

  console.log('✅ Hoàn tất nạp dữ liệu mẫu thành công!');
}

main()
  .catch((e) => {
    console.error('Lỗi khi seed dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
