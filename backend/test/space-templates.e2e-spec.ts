import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/prisma/prisma.service';
import { SPACE_TEMPLATES } from '../src/space/templates';

describe('Mẫu Không gian (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let http: ReturnType<typeof request>;
  let token: string;
  let tokenOther: string;
  const auth = (t: string) => ({ Authorization: `Bearer ${t}` });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
    await app.init();
    prisma = app.get(PrismaService);
    http = request(app.getHttpServer());
    const reg = async (email: string) =>
      (await http.post('/api/v1/auth/register').send({ email, password: 'Password123!', fullName: 'Người Dùng Mẫu' }).expect(201)).body.accessToken as string;
    token = await reg('tpl1@test.local');
    tokenOther = await reg('tpl2@test.local');
  });

  afterAll(async () => {
    await app.close();
  });

  it('liệt kê các mẫu với số việc và số ghi chú', async () => {
    const list = (await http.get('/api/v1/spaces/templates').set(auth(token)).expect(200)).body;
    expect(list.map((t: { id: string }) => t.id)).toEqual(SPACE_TEMPLATES.map((t) => t.id));
    const project = list.find((t: { id: string }) => t.id === 'project');
    expect(project).toMatchObject({ name: 'Đồ án / Dự án', taskCount: 5, noteCount: 1 });
    await http.get('/api/v1/spaces/templates').expect(401);
  });

  it.each(SPACE_TEMPLATES.map((t) => t.id))('tạo từ mẫu "%s": Không gian + đủ mục + đúng liên kết phụ thuộc', async (templateId) => {
    const tpl = SPACE_TEMPLATES.find((t) => t.id === templateId)!;
    const space = (await http.post('/api/v1/spaces/from-template').set(auth(token)).send({ templateId }).expect(201)).body;
    expect(space.name).toBe(tpl.name);
    expect(space.goal).toBe(tpl.goal);

    const objects = (await http.get(`/api/v1/objects?spaceId=${space.id}`).set(auth(token)).expect(200)).body;
    expect(objects).toHaveLength(tpl.items.length);
    expect(objects.filter((o: { type: string }) => o.type === 'NOTE')).toHaveLength(tpl.items.filter((i) => i.type === 'NOTE').length);

    // Mỗi cạnh phụ thuộc trong mẫu phải tồn tại đúng chiều (a phụ thuộc b)
    const titleToId = new Map(objects.map((o: { id: string; title: string }) => [o.title, o.id]));
    for (const [a, b] of tpl.dependencies) {
      const fromId = titleToId.get(tpl.items.find((i) => i.key === a)!.title) as string;
      const toId = titleToId.get(tpl.items.find((i) => i.key === b)!.title) as string;
      expect(await prisma.objectRelation.count({ where: { fromObjectId: fromId, toObjectId: toId, relationType: 'DEPENDS_ON' } })).toBe(1);
    }
  });

  it('việc phía sau trong chuỗi mẫu bị chặn, việc đầu chuỗi gợi ý được ngay', async () => {
    const space = (await http.post('/api/v1/spaces/from-template').set(auth(tokenOther)).send({ templateId: 'project' }).expect(201)).body;
    const overview = (await http.get('/api/v1/planning/overview').set(auth(tokenOther)).expect(200)).body;
    const suggested = overview.suggestions.map((s: { title: string }) => s.title);
    const blocked = overview.blocked.map((b: { title: string }) => b.title);
    expect(suggested).toContain('Khảo sát và xác định yêu cầu');
    expect(blocked).toEqual(expect.arrayContaining(['Thiết kế hệ thống', 'Cài đặt', 'Kiểm thử và sửa lỗi', 'Viết báo cáo']));
    expect(space.id).toBeTruthy();
  });

  it('đặt tên riêng; tạo nhiều lần không trùng dữ liệu; dữ liệu thuộc đúng người tạo', async () => {
    const a = (await http.post('/api/v1/spaces/from-template').set(auth(token)).send({ templateId: 'course', name: '  Giải tích 1  ' }).expect(201)).body;
    const b = (await http.post('/api/v1/spaces/from-template').set(auth(token)).send({ templateId: 'course', name: 'Giải tích 2' }).expect(201)).body;
    expect(a.name).toBe('Giải tích 1');
    expect(a.id).not.toBe(b.id);

    const aObjs = (await http.get(`/api/v1/objects?spaceId=${a.id}`).set(auth(token)).expect(200)).body.map((o: { id: string }) => o.id);
    const bObjs = (await http.get(`/api/v1/objects?spaceId=${b.id}`).set(auth(token)).expect(200)).body.map((o: { id: string }) => o.id);
    expect(aObjs.some((id: string) => bObjs.includes(id))).toBe(false);

    await http.get(`/api/v1/spaces/${a.id}`).set(auth(tokenOther)).expect(404);
    expect((await http.get(`/api/v1/objects?spaceId=${a.id}`).set(auth(tokenOther)).expect(200)).body).toEqual([]);
  });

  it('mẫu không tồn tại → 404; thiếu mã mẫu hoặc tên quá dài → 400; mục Note không có trạng thái', async () => {
    await http.post('/api/v1/spaces/from-template').set(auth(token)).send({ templateId: 'khong-co' }).expect(404);
    await http.post('/api/v1/spaces/from-template').set(auth(token)).send({}).expect(400);
    await http.post('/api/v1/spaces/from-template').set(auth(token)).send({ templateId: 'course', name: 'x'.repeat(101) }).expect(400);

    const space = (await http.post('/api/v1/spaces/from-template').set(auth(token)).send({ templateId: 'freelance' }).expect(201)).body;
    const objs = (await http.get(`/api/v1/objects?spaceId=${space.id}`).set(auth(token)).expect(200)).body;
    const note = objs.find((o: { type: string }) => o.type === 'NOTE');
    expect(note.status).toBeNull();
    expect(note.priority).toBeNull();
  });
});
