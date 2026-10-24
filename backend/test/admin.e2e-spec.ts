import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Admin (e2e) — phân quyền, khoá tài khoản, thống kê, quyền riêng tư', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let http: ReturnType<typeof request>;

  let adminToken: string;
  let adminId: string;
  let userToken: string;
  let userId: string;
  let victimId: string;

  const auth = (t: string) => ({ Authorization: `Bearer ${t}` });
  const SECRET_TITLE = 'BÍ-MẬT-TIÊU-ĐỀ-12345';
  const SECRET_DESC = 'BÍ-MẬT-NỘI-DUNG-67890';
  const SECRET_SPACE = 'BÍ-MẬT-KHÔNG-GIAN-24680';

  async function register(email: string) {
    const res = await http.post('/api/v1/auth/register').send({ email, password: 'Password123!', fullName: `Tên ${email}` }).expect(201);
    return { token: res.body.accessToken as string, id: res.body.user.id as string };
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
    await app.init();
    prisma = app.get(PrismaService);
    http = request(app.getHttpServer());

    const admin = await register('admin1@test.local');
    adminId = admin.id;
    await prisma.user.update({ where: { id: adminId }, data: { role: 'ADMIN' } });
    // token chứa id; vai trò được đọc lại từ CSDL mỗi request nên token cũ vẫn hợp lệ
    adminToken = admin.token;

    const user = await register('user1@test.local');
    userToken = user.token;
    userId = user.id;
    victimId = (await register('victim1@test.local')).id;

    // Dữ liệu cá nhân có chuỗi dễ nhận diện để kiểm tra không bị lộ
    const space = (await http.post('/api/v1/spaces').set(auth(userToken)).send({ name: SECRET_SPACE, description: SECRET_DESC }).expect(201)).body.id;
    await http
      .post('/api/v1/objects')
      .set(auth(userToken))
      .send({ type: 'NOTE', title: SECRET_TITLE, description: SECRET_DESC, spaceId: space })
      .expect(201);
    await http
      .post('/api/v1/objects')
      .set(auth(userToken))
      .send({ type: 'REFERENCE', title: 'Tài liệu', url: 'https://bi-mat.example.com/12345' })
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Phân quyền', () => {
    const routes: [string, string][] = [
      ['get', '/api/v1/admin/users'],
      ['get', '/api/v1/admin/stats'],
      ['get', '/api/v1/admin/audit-logs'],
      ['post', '/api/v1/admin/broadcast'],
      ['patch', '/api/v1/admin/users/00000000-0000-4000-8000-000000000000/lock'],
      ['patch', '/api/v1/admin/users/00000000-0000-4000-8000-000000000000/unlock'],
    ];

    it.each(routes)('người dùng thường gọi %s %s → 403', async (method, url) => {
      const req = (http as unknown as Record<string, (u: string) => request.Test>)[method](url).set(auth(userToken));
      await (method === 'post' ? req.send({ title: 'x', message: 'y' }) : req).expect(403);
    });

    it.each(routes)('chưa đăng nhập gọi %s %s → 401', async (method, url) => {
      await (http as unknown as Record<string, (u: string) => request.Test>)[method](url).expect(401);
    });

    it('Admin gọi được', async () => {
      await http.get('/api/v1/admin/users').set(auth(adminToken)).expect(200);
      await http.get('/api/v1/admin/stats').set(auth(adminToken)).expect(200);
    });
  });

  describe('Danh sách người dùng', () => {
    it('chỉ trả thông tin tài khoản và con số tổng hợp, kèm phân trang và tìm kiếm', async () => {
      const res = (await http.get('/api/v1/admin/users?search=user1@test').set(auth(adminToken)).expect(200)).body;
      expect(res.total).toBe(1);
      const item = res.items[0];
      expect(Object.keys(item).sort()).toEqual(
        ['createdAt', 'email', 'fullName', 'id', 'lastLoginAt', 'lockedAt', 'objectsCount', 'role', 'spacesCount'].sort(),
      );
      expect(item.objectsCount).toBe(2);
      expect(item.spacesCount).toBe(1);
      expect(item).not.toHaveProperty('passwordHash');

      const page = (await http.get('/api/v1/admin/users?page=1&pageSize=2').set(auth(adminToken)).expect(200)).body;
      expect(page.items).toHaveLength(2);
      expect(page.total).toBeGreaterThanOrEqual(3);
      await http.get('/api/v1/admin/users?pageSize=999').set(auth(adminToken)).expect(400);
    });
  });

  describe('Quyền riêng tư: Admin không đọc được nội dung cá nhân', () => {
    it('không API admin nào trả tiêu đề, nội dung, URL hay tên Không gian của người dùng', async () => {
      const bodies = await Promise.all(
        ['/api/v1/admin/users', '/api/v1/admin/stats', '/api/v1/admin/audit-logs'].map(async (u) =>
          JSON.stringify((await http.get(u).set(auth(adminToken)).expect(200)).body),
        ),
      );
      const all = bodies.join('\n');
      for (const secret of [SECRET_TITLE, SECRET_DESC, SECRET_SPACE, 'bi-mat.example.com']) {
        expect(all).not.toContain(secret);
      }
      expect(all).not.toContain('passwordHash');
    });

    it('Admin không dùng được API thường để đọc dữ liệu người khác (cách ly theo userId vẫn áp dụng)', async () => {
      const list = (await http.get('/api/v1/objects').set(auth(adminToken)).expect(200)).body;
      expect(JSON.stringify(list)).not.toContain(SECRET_TITLE);
      const secretObj = await prisma.object.findFirst({ where: { title: SECRET_TITLE } });
      await http.get(`/api/v1/objects/${secretObj!.id}`).set(auth(adminToken)).expect(404);
    });
  });

  describe('Khoá / mở khoá tài khoản', () => {
    it('không tự khoá chính mình, không khoá Admin khác, id lạ → 404, id sai định dạng → 400', async () => {
      await http.patch(`/api/v1/admin/users/${adminId}/lock`).set(auth(adminToken)).expect(400);

      const other = await register('admin2@test.local');
      await prisma.user.update({ where: { id: other.id }, data: { role: 'ADMIN' } });
      await http.patch(`/api/v1/admin/users/${other.id}/lock`).set(auth(adminToken)).expect(400);

      await http.patch('/api/v1/admin/users/00000000-0000-4000-8000-000000000000/lock').set(auth(adminToken)).expect(404);
      await http.patch('/api/v1/admin/users/abc/lock').set(auth(adminToken)).expect(400);
    });

    it('khoá thì không đăng nhập được và token cũ bị từ chối; mở khoá thì dùng lại được', async () => {
      const victim = await register('victim2@test.local');
      await http.patch(`/api/v1/admin/users/${victim.id}/lock`).set(auth(adminToken)).expect(200);

      await http.get('/api/v1/objects').set(auth(victim.token)).expect(401);
      await http.post('/api/v1/auth/login').send({ email: 'victim2@test.local', password: 'Password123!' }).expect(401);

      await http.patch(`/api/v1/admin/users/${victim.id}/unlock`).set(auth(adminToken)).expect(200);
      await http.get('/api/v1/objects').set(auth(victim.token)).expect(200);
    });

    it('hạ vai trò: người từng là Admin mà bị đổi về USER thì mất quyền ngay (vai trò đọc lại từ CSDL)', async () => {
      const temp = await register('temp-admin@test.local');
      await prisma.user.update({ where: { id: temp.id }, data: { role: 'ADMIN' } });
      await http.get('/api/v1/admin/stats').set(auth(temp.token)).expect(200);
      await prisma.user.update({ where: { id: temp.id }, data: { role: 'USER' } });
      await http.get('/api/v1/admin/stats').set(auth(temp.token)).expect(403);
    });
  });

  describe('Thống kê', () => {
    it('trả các con số tổng hợp và 14 ngày gần nhất theo giờ Việt Nam', async () => {
      const s = (await http.get('/api/v1/admin/stats').set(auth(adminToken)).expect(200)).body;
      expect(s.totalUsers).toBeGreaterThanOrEqual(4);
      expect(typeof s.activeUsers7d).toBe('number');
      expect(s.objectsByType.NOTE).toBeGreaterThanOrEqual(1);
      expect(s.objectsByType.REFERENCE).toBeGreaterThanOrEqual(1);
      expect(s.last14Days).toHaveLength(14);
      const today = s.last14Days[13];
      expect(today.newUsers).toBeGreaterThanOrEqual(4);
      expect(today.newObjects).toBeGreaterThanOrEqual(2);
      const dates = s.last14Days.map((d: { date: string }) => d.date);
      expect([...dates].sort()).toEqual(dates);
    });
  });

  describe('Thông báo hệ thống và nhật ký', () => {
    it('phát thông báo tới người dùng không bị khoá, ghi nhật ký; kiểm tra dữ liệu đầu vào', async () => {
      const locked = await register('locked1@test.local');
      await prisma.user.update({ where: { id: locked.id }, data: { lockedAt: new Date() } });

      const res = (
        await http.post('/api/v1/admin/broadcast').set(auth(adminToken)).send({ title: 'Bảo trì', message: 'Hệ thống bảo trì 22:00' }).expect(201)
      ).body;
      expect(res.recipients).toBeGreaterThanOrEqual(4);

      const mine = (await http.get('/api/v1/notifications').set(auth(userToken)).expect(200)).body.items;
      expect(mine.some((n: { type: string; title: string }) => n.type === 'SYSTEM' && n.title === 'Bảo trì')).toBe(true);
      expect(await prisma.notification.count({ where: { userId: locked.id } })).toBe(0);

      await http.post('/api/v1/admin/broadcast').set(auth(adminToken)).send({ title: '', message: 'x' }).expect(400);
      await http.post('/api/v1/admin/broadcast').set(auth(adminToken)).send({ title: 'x', message: 'y'.repeat(1001) }).expect(400);

      const logs = (await http.get('/api/v1/admin/audit-logs').set(auth(adminToken)).expect(200)).body;
      const actions = logs.map((l: { action: string }) => l.action);
      expect(actions).toEqual(expect.arrayContaining(['BROADCAST', 'LOCK_USER', 'UNLOCK_USER']));
      expect(logs[0].adminEmail).toBe('admin1@test.local');
    });

    it('người dùng thường không dùng được nhật ký / người bị khoá không nhận SYSTEM', async () => {
      await http.get('/api/v1/admin/audit-logs').set(auth(userToken)).expect(403);
      expect(userId).toBeTruthy();
      expect(victimId).toBeTruthy();
    });
  });
});
