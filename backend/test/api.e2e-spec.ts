import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/prisma/prisma.service';

describe('API (e2e) — cách ly dữ liệu, vòng đời, ràng buộc', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let http: ReturnType<typeof request>;

  let tokenA: string;
  let tokenB: string;
  let spaceA: string;
  let spaceB: string;
  let taskA: string;
  let noteA: string;

  const auth = (t: string) => ({ Authorization: `Bearer ${t}` });

  async function register(email: string) {
    const res = await http
      .post('/api/v1/auth/register')
      .send({ email, password: 'Password123!', fullName: 'Người Dùng Test' })
      .expect(201);
    return res.body.accessToken as string;
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

    tokenA = await register('a@test.local');
    tokenB = await register('b@test.local');

    spaceA = (await http.post('/api/v1/spaces').set(auth(tokenA)).send({ name: 'Space A' }).expect(201)).body.id;
    spaceB = (await http.post('/api/v1/spaces').set(auth(tokenB)).send({ name: 'Space B' }).expect(201)).body.id;
    taskA = (
      await http.post('/api/v1/objects').set(auth(tokenA)).send({ type: 'TASK', title: 'Việc của A', spaceId: spaceA }).expect(201)
    ).body.id;
    noteA = (await http.post('/api/v1/objects').set(auth(tokenA)).send({ type: 'NOTE', title: 'Ghi chú của A' }).expect(201)).body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Cách ly dữ liệu giữa người dùng (NFR-SEC-03)', () => {
    it('chưa đăng nhập thì bị từ chối (401)', async () => {
      await http.get('/api/v1/objects').expect(401);
      await http.get('/api/v1/spaces').expect(401);
    });

    it('B không xem được Object của A (404)', async () => {
      await http.get(`/api/v1/objects/${taskA}`).set(auth(tokenB)).expect(404);
    });

    it('B không sửa, đổi vòng đời, xoá được Object của A', async () => {
      await http.patch(`/api/v1/objects/${taskA}`).set(auth(tokenB)).send({ title: 'bị chiếm' }).expect(404);
      await http.patch(`/api/v1/objects/${taskA}/lifecycle`).set(auth(tokenB)).send({ action: 'TRASH' }).expect(404);
      await http.delete(`/api/v1/objects/${taskA}`).set(auth(tokenB)).expect(404);
    });

    it('B không xem/sửa/xoá được Space của A', async () => {
      await http.get(`/api/v1/spaces/${spaceA}`).set(auth(tokenB)).expect(404);
      await http.patch(`/api/v1/spaces/${spaceA}`).set(auth(tokenB)).send({ name: 'x' }).expect(404);
      await http.delete(`/api/v1/spaces/${spaceA}`).set(auth(tokenB)).expect(404);
    });

    it('B không gán Object của A vào Space của B, cũng không gán Object của B vào Space của A', async () => {
      await http.post(`/api/v1/objects/${taskA}/spaces/${spaceB}`).set(auth(tokenB)).expect(404);
      const noteB = (await http.post('/api/v1/objects').set(auth(tokenB)).send({ type: 'NOTE', title: 'Của B' }).expect(201)).body.id;
      await http.post(`/api/v1/objects/${noteB}/spaces/${spaceA}`).set(auth(tokenB)).expect(404);
    });

    it('B không tạo Object vào Space của A', async () => {
      await http.post('/api/v1/objects').set(auth(tokenB)).send({ type: 'NOTE', title: 'x', spaceId: spaceA }).expect(404);
    });

    it('B không tạo, xem, xoá được liên kết dính tới Object của A', async () => {
      const noteB = (await http.post('/api/v1/objects').set(auth(tokenB)).send({ type: 'NOTE', title: 'B2' }).expect(201)).body.id;
      await http.post('/api/v1/relations').set(auth(tokenB)).send({ fromObjectId: noteB, toObjectId: taskA, relationType: 'RELATES_TO' }).expect(404);
      await http.get(`/api/v1/relations/object/${taskA}`).set(auth(tokenB)).expect(404);

      const rel = (
        await http.post('/api/v1/relations').set(auth(tokenA)).send({ fromObjectId: taskA, toObjectId: noteA, relationType: 'REFERENCES' }).expect(201)
      ).body.id;
      await http.delete(`/api/v1/relations/${rel}`).set(auth(tokenB)).expect(404);
    });

    it('danh sách và tìm kiếm của B không chứa dữ liệu của A', async () => {
      const list = await http.get('/api/v1/objects').set(auth(tokenB)).expect(200);
      expect(list.body.some((o: { id: string }) => o.id === taskA)).toBe(false);
      const search = await http.get('/api/v1/objects?search=A').set(auth(tokenB)).expect(200);
      expect(search.body.some((o: { id: string }) => o.id === taskA)).toBe(false);
    });
  });

  describe('Vòng đời Object (QD-05)', () => {
    it('không xoá vĩnh viễn được mục chưa nằm trong Thùng rác (400)', async () => {
      await http.delete(`/api/v1/objects/${noteA}`).set(auth(tokenA)).expect(400);
    });

    it('API sửa thường không nhận type/lifecycle (400 do forbidNonWhitelisted)', async () => {
      await http.patch(`/api/v1/objects/${noteA}`).set(auth(tokenA)).send({ lifecycle: 'TRASH' }).expect(400);
      await http.patch(`/api/v1/objects/${noteA}`).set(auth(tokenA)).send({ type: 'TASK' }).expect(400);
    });

    it('Lưu trữ → Thùng rác → Khôi phục thì quay về Lưu trữ; Khôi phục lần nữa về ACTIVE', async () => {
      const id = (await http.post('/api/v1/objects').set(auth(tokenA)).send({ type: 'NOTE', title: 'Vòng đời' }).expect(201)).body.id;
      await http.patch(`/api/v1/objects/${id}/lifecycle`).set(auth(tokenA)).send({ action: 'ARCHIVE' }).expect(200);
      const trashed = await http.patch(`/api/v1/objects/${id}/lifecycle`).set(auth(tokenA)).send({ action: 'TRASH' }).expect(200);
      expect(trashed.body.lifecycle).toBe('TRASH');
      const r1 = await http.patch(`/api/v1/objects/${id}/lifecycle`).set(auth(tokenA)).send({ action: 'RESTORE' }).expect(200);
      expect(r1.body.lifecycle).toBe('ARCHIVED');
      const r2 = await http.patch(`/api/v1/objects/${id}/lifecycle`).set(auth(tokenA)).send({ action: 'RESTORE' }).expect(200);
      expect(r2.body.lifecycle).toBe('ACTIVE');
      expect(r2.body.archivedAt).toBeNull();
    });

    it('chuyển vào Thùng rác xong thì xoá vĩnh viễn được và dọn sạch gán Space + liên kết', async () => {
      const id = (
        await http.post('/api/v1/objects').set(auth(tokenA)).send({ type: 'NOTE', title: 'Sẽ xoá', spaceId: spaceA }).expect(201)
      ).body.id;
      await http.post('/api/v1/relations').set(auth(tokenA)).send({ fromObjectId: id, toObjectId: taskA, relationType: 'RELATES_TO' }).expect(201);
      await http.patch(`/api/v1/objects/${id}/lifecycle`).set(auth(tokenA)).send({ action: 'TRASH' }).expect(200);
      await http.delete(`/api/v1/objects/${id}`).set(auth(tokenA)).expect(200);
      expect(await prisma.spaceObject.count({ where: { objectId: id } })).toBe(0);
      expect(await prisma.objectRelation.count({ where: { OR: [{ fromObjectId: id }, { toObjectId: id }] } })).toBe(0);
    });

    it('liên kết với mục trong Thùng rác bị chặn (QD-09)', async () => {
      const id = (await http.post('/api/v1/objects').set(auth(tokenA)).send({ type: 'NOTE', title: 'Rác' }).expect(201)).body.id;
      await http.patch(`/api/v1/objects/${id}/lifecycle`).set(auth(tokenA)).send({ action: 'TRASH' }).expect(200);
      await http.post('/api/v1/relations').set(auth(tokenA)).send({ fromObjectId: taskA, toObjectId: id, relationType: 'RELATES_TO' }).expect(400);
    });
  });

  describe('Gán nhiều Space và xoá Space (QD-04)', () => {
    it('một Object nằm ở 2 Space; xoá 1 Space thì Object vẫn còn, xoá nốt thì về Hộp nhận', async () => {
      const s2 = (await http.post('/api/v1/spaces').set(auth(tokenA)).send({ name: 'Space A2' }).expect(201)).body.id;
      const id = (
        await http.post('/api/v1/objects').set(auth(tokenA)).send({ type: 'NOTE', title: 'Đa Space', spaceId: spaceA }).expect(201)
      ).body.id;
      await http.post(`/api/v1/objects/${id}/spaces/${s2}`).set(auth(tokenA)).expect(201);

      await http.delete(`/api/v1/spaces/${s2}`).set(auth(tokenA)).expect(200);
      const stillThere = await http.get(`/api/v1/objects/${id}`).set(auth(tokenA)).expect(200);
      expect(stillThere.body.spaceObjects).toHaveLength(1);

      await http.delete(`/api/v1/objects/${id}/spaces/${spaceA}`).set(auth(tokenA)).expect(200);
      const inbox = await http.get('/api/v1/objects?unassigned=true').set(auth(tokenA)).expect(200);
      expect(inbox.body.some((o: { id: string }) => o.id === id)).toBe(true);
    });
  });

  describe('Ràng buộc theo loại (QD-07)', () => {
    it('Event thiếu giờ bắt đầu, hoặc kết thúc trước bắt đầu → 400', async () => {
      await http.post('/api/v1/objects').set(auth(tokenA)).send({ type: 'EVENT', title: 'E' }).expect(400);
      await http
        .post('/api/v1/objects')
        .set(auth(tokenA))
        .send({ type: 'EVENT', title: 'E', startAt: '2026-11-01T10:00:00.000Z', endAt: '2026-11-01T09:00:00.000Z' })
        .expect(400);
    });

    it('Reference thiếu hoặc sai URL → 400', async () => {
      await http.post('/api/v1/objects').set(auth(tokenA)).send({ type: 'REFERENCE', title: 'R' }).expect(400);
      await http.post('/api/v1/objects').set(auth(tokenA)).send({ type: 'REFERENCE', title: 'R', url: 'khong-phai-url' }).expect(400);
    });

    it('Note không có status/priority; Task mặc định TODO + MEDIUM', async () => {
      const note = await http.post('/api/v1/objects').set(auth(tokenA)).send({ type: 'NOTE', title: 'N', status: 'DONE' }).expect(201);
      expect(note.body.status).toBeNull();
      expect(note.body.priority).toBeNull();
      const task = await http.post('/api/v1/objects').set(auth(tokenA)).send({ type: 'TASK', title: 'T' }).expect(201);
      expect(task.body.status).toBe('TODO');
      expect(task.body.priority).toBe('MEDIUM');
    });

    it('CSDL tự chặn dữ liệu sai dù đi đường tắt (CHECK constraint)', async () => {
      const user = await prisma.user.findFirst({ where: { email: 'a@test.local' } });
      await expect(
        prisma.$executeRawUnsafe(
          `INSERT INTO objects (id, user_id, type, title, updated_at) VALUES (gen_random_uuid(), '${user!.id}', 'EVENT', 'x', now())`,
        ),
      ).rejects.toThrow();
    });
  });

  describe('Tài khoản', () => {
    it('mật khẩu dưới 8 ký tự bị từ chối; đăng nhập sai báo lỗi chung', async () => {
      await http.post('/api/v1/auth/register').send({ email: 'c@test.local', password: '1234567', fullName: 'C' }).expect(400);
      const res = await http.post('/api/v1/auth/login').send({ email: 'a@test.local', password: 'sai-mat-khau' }).expect(401);
      expect(res.body.message).toBe('Email hoặc mật khẩu không chính xác');
    });

    it('tài khoản bị khoá: sai mật khẩu vẫn báo lỗi chung, đúng mật khẩu mới báo bị khoá; token cũ bị chặn', async () => {
      await prisma.user.update({ where: { email: 'b@test.local' }, data: { lockedAt: new Date() } });
      const wrong = await http.post('/api/v1/auth/login').send({ email: 'b@test.local', password: 'sai-mat-khau' }).expect(401);
      expect(wrong.body.message).toBe('Email hoặc mật khẩu không chính xác');
      const right = await http.post('/api/v1/auth/login').send({ email: 'b@test.local', password: 'Password123!' }).expect(401);
      expect(right.body.message).toContain('khóa');
      await http.get('/api/v1/objects').set(auth(tokenB)).expect(401);
    });
  });
});
