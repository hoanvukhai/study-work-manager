import * as bcrypt from 'bcrypt';
import { PrismaClient, ObjectType, TaskStatus, Priority, ObjectLifecycle, RelationType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data for study-work-manager...');

  // 1. Create Demo User: Vu Khai Hoan
  const user = await prisma.user.upsert({
    where: { email: 'hoan@example.com' },
    update: {},
    create: {
      email: 'hoan@example.com',
      fullName: 'Vũ Khải Hoàn',
      passwordHash: await bcrypt.hash('Password123!', 10),
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hoan',
    },
  });
  console.log(`Created user: ${user.fullName} (${user.email})`);

  // 2. Create Spaces
  const thesisSpace = await prisma.space.create({
    data: {
      userId: user.id,
      name: 'Đồ án tốt nghiệp',
      icon: '🎓',
      color: '#1a73e8',
      description: 'Hệ thống Quản lý Học tập và Công việc Cá nhân',
    },
  });

  const freelanceSpace = await prisma.space.create({
    data: {
      userId: user.id,
      name: 'Việc Freelance',
      icon: '💼',
      color: '#f59e0b',
      description: 'Các dự án nhận thêm ngoài giờ',
    },
  });
  console.log(`Created spaces: "${thesisSpace.name}", "${freelanceSpace.name}"`);

  // 3. Create Diverse Objects
  const noteThesis = await prisma.object.create({
    data: {
      userId: user.id,
      type: ObjectType.NOTE,
      title: 'Ghi chú góp ý của Thầy Cường',
      description: '- Tập trung vào kiến trúc Hybrid Object\n- Chú ý liên kết chéo giữa Note và Task\n- Giao diện tối giản theo chuẩn Google',
      lifecycle: ObjectLifecycle.ACTIVE,
    },
  });

  const taskApi = await prisma.object.create({
    data: {
      userId: user.id,
      type: ObjectType.TASK,
      title: 'Hoàn thiện bản thiết kế 22 API endpoints',
      description: 'Đặc tả chi tiết Request/Response cho module Object và Relation',
      status: TaskStatus.DONE,
      priority: Priority.HIGH,
      lifecycle: ObjectLifecycle.ACTIVE,
      dueDate: new Date(Date.now() + 86400000 * 2),
    },
  });

  const taskSeed = await prisma.object.create({
    data: {
      userId: user.id,
      type: ObjectType.TASK,
      title: 'Khởi tạo Prisma Schema và nạp dữ liệu mẫu 8 bảng',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.URGENT,
      lifecycle: ObjectLifecycle.ACTIVE,
      dueDate: new Date(Date.now() + 86400000 * 1),
    },
  });

  const refNest = await prisma.object.create({
    data: {
      userId: user.id,
      type: ObjectType.REFERENCE,
      title: 'NestJS & Prisma Documentation',
      url: 'https://docs.nestjs.com/recipes/prisma',
      lifecycle: ObjectLifecycle.ACTIVE,
    },
  });

  // 4. Place Objects into Spaces (SpaceObject)
  await prisma.spaceObject.createMany({
    data: [
      { spaceId: thesisSpace.id, objectId: noteThesis.id, position: 0, isPinned: true },
      { spaceId: thesisSpace.id, objectId: taskApi.id, position: 1, isPinned: false },
      { spaceId: thesisSpace.id, objectId: taskSeed.id, position: 2, isPinned: true },
      { spaceId: thesisSpace.id, objectId: refNest.id, position: 3, isPinned: false },
    ],
  });
  console.log('Placed 4 objects into Space "Đồ án tốt nghiệp"');

  // 5. Create Bi-directional Relation (ObjectRelation)
  await prisma.objectRelation.create({
    data: {
      fromObjectId: taskSeed.id,
      toObjectId: noteThesis.id,
      relationType: RelationType.DEPENDS_ON,
    },
  });
  console.log('Created relation: Task "Khởi tạo Prisma" DEPENDS_ON Note "Góp ý của Thầy Cường"');

  // 6. Create Tag
  const tagArchitecture = await prisma.tag.create({
    data: {
      userId: user.id,
      name: 'KiếnTrúc',
      color: '#3b82f6',
    },
  });
  await prisma.objectTag.create({
    data: {
      objectId: noteThesis.id,
      tagId: tagArchitecture.id,
    },
  });

  // 7. Create Notification
  await prisma.notification.create({
    data: {
      userId: user.id,
      objectId: taskSeed.id,
      title: 'Nhắc nhở hạn chót',
      message: 'Nhiệm vụ "Khởi tạo Prisma Schema" cần hoàn thành trong hôm nay.',
    },
  });
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
