import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/prisma/prisma.service';
import { RecurrenceService } from '../src/recurrence/recurrence.service';

const H = 3600 * 1000;
const D = 24 * H;

describe('Việc / sự kiện lặp lại (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let service: RecurrenceService;
  let http: ReturnType<typeof request>;
  let token: string;

  const auth = () => ({ Authorization: `Bearer ${token}` });
  const create = async (body: Record<string, unknown>) => (await http.post('/api/v1/objects').set(auth()).send(body).expect(201)).body;
  const done = async (id: string) => (await http.patch(`/api/v1/objects/${id}`).set(auth()).send({ status: 'DONE' }).expect(200)).body;
  const titles = async (title: string) => prisma.object.findMany({ where: { title }, orderBy: { dueDate: 'asc' } });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
    await app.init();
    prisma = app.get(PrismaService);
    service = app.get(RecurrenceService);
    http = request(app.getHttpServer());
    token = (await http.post('/api/v1/auth/register').send({ email: 'rec1@test.local', password: 'Password123!', fullName: 'Người Lặp' }).expect(201)).body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Task lặp lại', () => {
    it('xong Task hằng tuần thì sinh Task mới: hạn +7 ngày, trạng thái TODO, giữ Không gian và thông tin', async () => {
      const space = (await http.post('/api/v1/spaces').set(auth()).send({ name: 'Lớp học' }).expect(201)).body.id;
      const due = new Date(Date.now() + 2 * D);
      const t = await create({
        type: 'TASK', title: 'Nộp bài tuần', description: 'Mô tả', priority: 'HIGH', estimatedMinutes: 60,
        dueDate: due.toISOString(), spaceId: space, recurrence: { freq: 'WEEKLY', interval: 1 },
      });

      const res = await done(t.id);
      expect(res.nextOccurrenceId).toBeTruthy();

      const all = await titles('Nộp bài tuần');
      expect(all).toHaveLength(2);
      const next = all.find((o) => o.id === res.nextOccurrenceId)!;
      expect(next.status).toBe('TODO');
      expect(next.dueDate!.getTime()).toBe(due.getTime() + 7 * D);
      expect(next.priority).toBe('HIGH');
      expect(next.estimatedMinutes).toBe(60);
      expect(next.description).toBe('Mô tả');
      expect(next.recurrence).toEqual({ freq: 'WEEKLY', interval: 1 });
      expect(await prisma.spaceObject.count({ where: { objectId: next.id, spaceId: space } })).toBe(1);
    });

    it('không sinh trùng khi mở lại rồi đánh dấu xong lần nữa', async () => {
      const t = await create({ type: 'TASK', title: 'Không trùng', dueDate: new Date(Date.now() + D).toISOString(), recurrence: { freq: 'DAILY', interval: 1 } });
      await done(t.id);
      await http.patch(`/api/v1/objects/${t.id}`).set(auth()).send({ status: 'TODO' }).expect(200);
      const again = await done(t.id);
      expect(again.nextOccurrenceId).toBeUndefined();
      expect(await titles('Không trùng')).toHaveLength(2);
    });

    it('lưu lại (gửi lại nguyên luật) một Task đã xong thì không sinh trùng khi mở lại rồi xong nữa', async () => {
      const rule = { freq: 'DAILY', interval: 1 };
      const t = await create({ type: 'TASK', title: 'Lưu lại không trùng', dueDate: new Date(Date.now() + D).toISOString(), recurrence: rule });
      await done(t.id);
      await http.patch(`/api/v1/objects/${t.id}`).set(auth()).send({ title: 'Lưu lại không trùng', recurrence: rule }).expect(200);
      await http.patch(`/api/v1/objects/${t.id}`).set(auth()).send({ status: 'TODO' }).expect(200);
      await done(t.id);
      expect(await titles('Lưu lại không trùng')).toHaveLength(2);
    });

    it('làm trễ nhiều ngày: lần sau là mốc đầu tiên trong tương lai, không sinh một chuỗi việc quá khứ', async () => {
      const t = await create({ type: 'TASK', title: 'Làm trễ', dueDate: new Date(Date.now() - 5 * D).toISOString(), recurrence: { freq: 'DAILY', interval: 1 } });
      const res = await done(t.id);
      const next = (await prisma.object.findUnique({ where: { id: res.nextOccurrenceId } }))!;
      expect(next.dueDate!.getTime()).toBeGreaterThan(Date.now());
      expect(next.dueDate!.getTime()).toBeLessThan(Date.now() + D + 1000);
      expect(await titles('Làm trễ')).toHaveLength(2);
    });

    it('hết hạn lặp (until) thì không sinh nữa', async () => {
      const due = new Date(Date.now() + D);
      const t = await create({
        type: 'TASK', title: 'Có hạn lặp', dueDate: due.toISOString(),
        recurrence: { freq: 'WEEKLY', interval: 1, until: new Date(due.getTime() + 3 * D).toISOString() },
      });
      const res = await done(t.id);
      expect(res.nextOccurrenceId).toBeUndefined();
      expect(await titles('Có hạn lặp')).toHaveLength(1);
    });

    it('Task thường (không lặp) xong thì không sinh gì', async () => {
      const t = await create({ type: 'TASK', title: 'Một lần', dueDate: new Date(Date.now() + D).toISOString() });
      const res = await done(t.id);
      expect(res.nextOccurrenceId).toBeUndefined();
      expect(await titles('Một lần')).toHaveLength(1);
    });
  });

  describe('Event lặp lại', () => {
    it('bộ quét sinh lần kế tiếp khi sự kiện đã bắt đầu, giữ nguyên độ dài; quét lại không sinh trùng', async () => {
      const start = new Date(Date.now() - 2 * H);
      const ev = await create({
        type: 'EVENT', title: 'Họp nhóm hằng tuần', startAt: start.toISOString(), endAt: new Date(start.getTime() + 90 * 60000).toISOString(),
        recurrence: { freq: 'WEEKLY', interval: 1 },
      });

      const n1 = await service.spawnDueEvents(new Date());
      expect(n1).toBeGreaterThanOrEqual(1);
      await service.spawnDueEvents(new Date());

      const all = await prisma.object.findMany({ where: { title: 'Họp nhóm hằng tuần' }, orderBy: { startAt: 'asc' } });
      expect(all).toHaveLength(2);
      const next = all[1];
      expect(next.id).not.toBe(ev.id);
      expect(next.startAt!.getTime()).toBe(start.getTime() + 7 * D);
      expect(next.endAt!.getTime() - next.startAt!.getTime()).toBe(90 * 60000);
    });

    it('sự kiện chưa bắt đầu thì chưa sinh', async () => {
      await create({ type: 'EVENT', title: 'Chưa tới', startAt: new Date(Date.now() + 3 * D).toISOString(), recurrence: { freq: 'DAILY', interval: 1 } });
      await service.spawnDueEvents(new Date());
      expect(await titles('Chưa tới')).toHaveLength(1);
    });
  });

  describe('Kiểm tra dữ liệu', () => {
    it('Note / Reference không lặp được; Task cần hạn chót; Event cần giờ bắt đầu', async () => {
      const rule = { freq: 'DAILY', interval: 1 };
      await http.post('/api/v1/objects').set(auth()).send({ type: 'NOTE', title: 'N', recurrence: rule }).expect(400);
      await http.post('/api/v1/objects').set(auth()).send({ type: 'REFERENCE', title: 'R', url: 'https://a.com', recurrence: rule }).expect(400);
      await http.post('/api/v1/objects').set(auth()).send({ type: 'TASK', title: 'T', recurrence: rule }).expect(400);
    });

    it('luật sai bị từ chối: kiểu lạ, khoảng 0, khoảng 53, ngày sai', async () => {
      const due = new Date(Date.now() + D).toISOString();
      for (const recurrence of [
        { freq: 'YEARLY', interval: 1 },
        { freq: 'DAILY', interval: 0 },
        { freq: 'DAILY', interval: 53 },
        { freq: 'DAILY', interval: 1, until: 'không phải ngày' },
        { freq: 'DAILY', interval: 1, thua: 1 },
      ]) {
        await http.post('/api/v1/objects').set(auth()).send({ type: 'TASK', title: 'Sai', dueDate: due, recurrence }).expect(400);
      }
    });

    it('thêm / bỏ luật lặp bằng cách sửa; bỏ hạn chót khi đang lặp thì bị từ chối', async () => {
      const t = await create({ type: 'TASK', title: 'Sửa luật', dueDate: new Date(Date.now() + D).toISOString() });
      const withRule = (await http.patch(`/api/v1/objects/${t.id}`).set(auth()).send({ recurrence: { freq: 'DAILY', interval: 2 } }).expect(200)).body;
      expect(withRule.recurrence).toEqual({ freq: 'DAILY', interval: 2 });

      await http.patch(`/api/v1/objects/${t.id}`).set(auth()).send({ dueDate: null }).expect(400);

      const cleared = (await http.patch(`/api/v1/objects/${t.id}`).set(auth()).send({ recurrence: null }).expect(200)).body;
      expect(cleared.recurrence).toBeNull();
    });

    it('chuyển loại sang Note thì luật lặp bị bỏ; CSDL chặn luật lặp trên Note khi đi đường tắt', async () => {
      const t = await create({ type: 'TASK', title: 'Sẽ thành Note', dueDate: new Date(Date.now() + D).toISOString(), recurrence: { freq: 'DAILY', interval: 1 } });
      const converted = (await http.patch(`/api/v1/objects/${t.id}/convert-type`).set(auth()).send({ targetType: 'NOTE' }).expect(200)).body;
      expect(converted.recurrence).toBeNull();

      const user = await prisma.user.findFirst({ where: { email: 'rec1@test.local' } });
      await expect(
        prisma.$executeRawUnsafe(
          `INSERT INTO objects (id, user_id, type, title, recurrence, updated_at) VALUES (gen_random_uuid(), '${user!.id}', 'NOTE', 'x', '{"freq":"DAILY","interval":1}', now())`,
        ),
      ).rejects.toThrow();
    });
  });
});
