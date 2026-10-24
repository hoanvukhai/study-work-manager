import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/prisma/prisma.service';
import { NotificationsService } from '../src/notifications/notifications.service';
import { localMinuteOfDay } from '../src/notifications/rules';

const H = 3600 * 1000;
const D = 24 * H;

describe('Thông báo (e2e) — quét định kỳ, chống trùng, cài đặt, cách ly', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let service: NotificationsService;
  let http: ReturnType<typeof request>;

  const auth = (t: string) => ({ Authorization: `Bearer ${t}` });
  let counter = 0;

  async function newUser() {
    counter += 1;
    const email = `notif${counter}@test.local`;
    const res = await http
      .post('/api/v1/auth/register')
      .send({ email, password: 'Password123!', fullName: 'Người Nhận' })
      .expect(201);
    return { token: res.body.accessToken as string, id: res.body.user.id as string, email };
  }

  const createObj = async (t: string, body: Record<string, unknown>) =>
    (await http.post('/api/v1/objects').set(auth(t)).send(body).expect(201)).body;

  const list = async (t: string, unreadOnly = false) =>
    (await http.get(`/api/v1/notifications${unreadOnly ? '?unreadOnly=true' : ''}`).set(auth(t)).expect(200)).body as {
      items: { id: string; type: string; objectId: string | null; isRead: boolean; message: string }[];
      unreadCount: number;
    };

  const typesOf = async (t: string) => (await list(t)).items.map((i) => i.type);

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
    await app.init();
    prisma = app.get(PrismaService);
    service = app.get(NotificationsService);
    http = request(app.getHttpServer());
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Quét việc sắp đến hạn / quá hạn / sự kiện', () => {
    it('tạo thông báo sắp đến hạn, quét lại không tạo trùng, đổi hạn chót thì báo lại', async () => {
      const u = await newUser();
      const task = await createObj(u.token, {
        type: 'TASK',
        title: 'Nộp báo cáo',
        dueDate: new Date(Date.now() + 2 * H).toISOString(),
      });

      await service.scanAndCreate(new Date());
      let items = (await list(u.token)).items.filter((i) => i.objectId === task.id);
      expect(items.map((i) => i.type)).toEqual(['DEADLINE_SOON']);
      expect(items[0].message).toContain('Nộp báo cáo');

      await service.scanAndCreate(new Date());
      await service.scanAndCreate(new Date());
      items = (await list(u.token)).items.filter((i) => i.objectId === task.id);
      expect(items).toHaveLength(1); // chống trùng

      await http
        .patch(`/api/v1/objects/${task.id}`)
        .set(auth(u.token))
        .send({ dueDate: new Date(Date.now() + 3 * H).toISOString() })
        .expect(200);
      await service.scanAndCreate(new Date());
      items = (await list(u.token)).items.filter((i) => i.objectId === task.id);
      expect(items).toHaveLength(2); // hạn mới → báo lại
    });

    it('quá hạn: nhắc một lần mỗi ngày; quá hạn hơn 7 ngày hoặc chưa tới giờ nhắc thì bỏ qua', async () => {
      const u = await newUser();
      const late = await createObj(u.token, { type: 'TASK', title: 'Trễ 1 giờ', dueDate: new Date(Date.now() - H).toISOString() });
      const ancient = await createObj(u.token, { type: 'TASK', title: 'Trễ 10 ngày', dueDate: new Date(Date.now() - 10 * D).toISOString() });
      const far = await createObj(u.token, { type: 'TASK', title: 'Còn 3 ngày', dueDate: new Date(Date.now() + 3 * D).toISOString() });

      await service.scanAndCreate(new Date());
      await service.scanAndCreate(new Date());
      const items = (await list(u.token)).items;
      expect(items.filter((i) => i.objectId === late.id).map((i) => i.type)).toEqual(['OVERDUE']);
      expect(items.some((i) => i.objectId === ancient.id)).toBe(false);
      expect(items.some((i) => i.objectId === far.id)).toBe(false);
    });

    it('sự kiện sắp diễn ra được nhắc; việc đã xong / Thùng rác / Lưu trữ thì không', async () => {
      const u = await newUser();
      const soon = new Date(Date.now() + 2 * H).toISOString();
      const ev = await createObj(u.token, { type: 'EVENT', title: 'Họp thầy', startAt: soon });
      const done = await createObj(u.token, { type: 'TASK', title: 'Đã xong', dueDate: soon, status: 'DONE' });
      const cancelled = await createObj(u.token, { type: 'TASK', title: 'Đã huỷ', dueDate: soon, status: 'CANCELLED' });
      const trashed = await createObj(u.token, { type: 'TASK', title: 'Trong rác', dueDate: soon });
      const archived = await createObj(u.token, { type: 'TASK', title: 'Lưu trữ', dueDate: soon });
      await http.patch(`/api/v1/objects/${trashed.id}/lifecycle`).set(auth(u.token)).send({ action: 'TRASH' }).expect(200);
      await http.patch(`/api/v1/objects/${archived.id}/lifecycle`).set(auth(u.token)).send({ action: 'ARCHIVE' }).expect(200);

      await service.scanAndCreate(new Date());
      const items = (await list(u.token)).items;
      expect(items.filter((i) => i.objectId === ev.id).map((i) => i.type)).toEqual(['EVENT_SOON']);
      for (const o of [done, cancelled, trashed, archived]) {
        expect(items.some((i) => i.objectId === o.id)).toBe(false);
      }
    });

    it('người dùng bị khoá không nhận thông báo', async () => {
      const u = await newUser();
      await createObj(u.token, { type: 'TASK', title: 'Của người bị khoá', dueDate: new Date(Date.now() + H).toISOString() });
      await prisma.user.update({ where: { id: u.id }, data: { lockedAt: new Date() } });
      await service.scanAndCreate(new Date());
      expect(await prisma.notification.count({ where: { userId: u.id } })).toBe(0);
    });
  });

  describe('Cài đặt thông báo', () => {
    it('mặc định nhắc trước 1 ngày; đổi còn 5 phút thì việc còn 2 giờ không được nhắc', async () => {
      const u = await newUser();
      const s = (await http.get('/api/v1/notifications/settings').set(auth(u.token)).expect(200)).body;
      expect(s.remindBeforeMinutes).toBe(1440);
      expect(s.quietHoursEnabled).toBe(false);

      await http.patch('/api/v1/notifications/settings').set(auth(u.token)).send({ remindBeforeMinutes: 5 }).expect(200);
      await createObj(u.token, { type: 'TASK', title: 'Còn 2 giờ', dueDate: new Date(Date.now() + 2 * H).toISOString() });
      await service.scanAndCreate(new Date());
      expect(await typesOf(u.token)).toEqual([]);
    });

    it('tắt từng loại thì loại đó không được tạo', async () => {
      const u = await newUser();
      await http.patch('/api/v1/notifications/settings').set(auth(u.token)).send({ enableDeadline: false, enableEvent: false }).expect(200);
      const soon = new Date(Date.now() + 2 * H).toISOString();
      await createObj(u.token, { type: 'TASK', title: 'T', dueDate: soon });
      await createObj(u.token, { type: 'EVENT', title: 'E', startAt: soon });
      await service.scanAndCreate(new Date());
      expect(await typesOf(u.token)).toEqual([]);
    });

    it('giờ yên lặng: đang trong khoảng yên lặng thì không tạo; ra khỏi khoảng thì tạo', async () => {
      const u = await newUser();
      await createObj(u.token, { type: 'TASK', title: 'Việc trong giờ yên lặng', dueDate: new Date(Date.now() + H).toISOString() });
      const nowMin = localMinuteOfDay(new Date());
      const start = (nowMin - 30 + 1440) % 1440;
      const end = (nowMin + 30) % 1440;
      await http
        .patch('/api/v1/notifications/settings')
        .set(auth(u.token))
        .send({ quietHoursEnabled: true, quietStartMinute: start, quietEndMinute: end })
        .expect(200);

      await service.scanAndCreate(new Date());
      expect(await typesOf(u.token)).toEqual([]);

      await http.patch('/api/v1/notifications/settings').set(auth(u.token)).send({ quietHoursEnabled: false }).expect(200);
      await service.scanAndCreate(new Date());
      expect(await typesOf(u.token)).toEqual(['DEADLINE_SOON']);
    });

    it('kiểm tra dữ liệu cài đặt: nhắc trước 1 phút, giờ yên lặng 2000 → 400', async () => {
      const u = await newUser();
      await http.patch('/api/v1/notifications/settings').set(auth(u.token)).send({ remindBeforeMinutes: 1 }).expect(400);
      await http.patch('/api/v1/notifications/settings').set(auth(u.token)).send({ quietStartMinute: 2000 }).expect(400);
      await http.patch('/api/v1/notifications/settings').set(auth(u.token)).send({ khongCo: true }).expect(400);
    });
  });

  describe('Móc từ thao tác khác', () => {
    it('đánh dấu Task xong thì xoá nhắc hạn chưa đọc của nó', async () => {
      const u = await newUser();
      const t = await createObj(u.token, { type: 'TASK', title: 'Sắp xong', dueDate: new Date(Date.now() + H).toISOString() });
      await service.scanAndCreate(new Date());
      expect((await list(u.token)).items.filter((i) => i.objectId === t.id)).toHaveLength(1);

      await http.patch(`/api/v1/objects/${t.id}`).set(auth(u.token)).send({ status: 'DONE' }).expect(200);
      expect((await list(u.token)).items.filter((i) => i.objectId === t.id)).toHaveLength(0);
    });

    it('đưa vào Thùng rác cũng xoá nhắc hạn chưa đọc', async () => {
      const u = await newUser();
      const t = await createObj(u.token, { type: 'TASK', title: 'Sẽ vứt', dueDate: new Date(Date.now() + H).toISOString() });
      await service.scanAndCreate(new Date());
      await http.patch(`/api/v1/objects/${t.id}/lifecycle`).set(auth(u.token)).send({ action: 'TRASH' }).expect(200);
      expect((await list(u.token)).items.filter((i) => i.objectId === t.id)).toHaveLength(0);
    });

    it('báo "được mở khoá" chỉ khi mọi việc tiền đề đã xong', async () => {
      const u = await newUser();
      const pre1 = await createObj(u.token, { type: 'TASK', title: 'Tiền đề 1' });
      const pre2 = await createObj(u.token, { type: 'TASK', title: 'Tiền đề 2' });
      const next = await createObj(u.token, { type: 'TASK', title: 'Việc chờ' });
      for (const p of [pre1, pre2]) {
        await http
          .post('/api/v1/relations')
          .set(auth(u.token))
          .send({ fromObjectId: next.id, toObjectId: p.id, relationType: 'DEPENDS_ON' })
          .expect(201);
      }

      await http.patch(`/api/v1/objects/${pre1.id}`).set(auth(u.token)).send({ status: 'DONE' }).expect(200);
      expect(await typesOf(u.token)).not.toContain('UNBLOCKED'); // còn Tiền đề 2

      await http.patch(`/api/v1/objects/${pre2.id}`).set(auth(u.token)).send({ status: 'DONE' }).expect(200);
      const unblocked = (await list(u.token)).items.filter((i) => i.type === 'UNBLOCKED');
      expect(unblocked).toHaveLength(1);
      expect(unblocked[0].objectId).toBe(next.id);
      expect(unblocked[0].message).toContain('Việc chờ');
    });
  });

  describe('Bản tin buổi sáng và thẻ cần ôn', () => {
    it('bản tin gộp việc đến hạn hôm nay + quá hạn + sự kiện; gửi lại không trùng; không có gì thì không gửi', async () => {
      const empty = await newUser();
      const u = await newUser();
      const now = new Date();
      await createObj(u.token, { type: 'TASK', title: 'Quá hạn', dueDate: new Date(now.getTime() - 3 * D).toISOString() });
      await createObj(u.token, { type: 'EVENT', title: 'Họp', startAt: new Date(now.getTime() + 60000).toISOString() });

      await service.sendDailyDigest(now);
      await service.sendDailyDigest(now);

      const digest = (await list(u.token)).items.filter((i) => i.type === 'DAILY_DIGEST');
      expect(digest).toHaveLength(1);
      expect(digest[0].message).toContain('1 việc quá hạn');
      expect((await list(empty.token)).items.filter((i) => i.type === 'DAILY_DIGEST')).toHaveLength(0);
    });

    it('nhắc ôn tập khi có từ 5 thẻ đến hạn, một lần mỗi ngày', async () => {
      const u = await newUser();
      const note = await createObj(u.token, {
        type: 'NOTE',
        title: 'Nhiều thẻ',
        description: Array.from({ length: 6 }, (_, i) => `Hỏi ${i} :: Đáp ${i}`).join('\n'),
      });
      await http.post(`/api/v1/study/notes/${note.id}/sync-cards`).set(auth(u.token)).expect(200);

      await service.scanAndCreate(new Date());
      await service.scanAndCreate(new Date());
      const study = (await list(u.token)).items.filter((i) => i.type === 'STUDY_DUE');
      expect(study).toHaveLength(1);
      expect(study[0].message).toContain('6 thẻ');
    });
  });

  describe('API người dùng và cách ly dữ liệu', () => {
    it('đánh dấu đã đọc, đọc tất cả, xoá, đếm chưa đọc, lọc chưa đọc', async () => {
      const u = await newUser();
      await createObj(u.token, { type: 'TASK', title: 'A', dueDate: new Date(Date.now() + H).toISOString() });
      await createObj(u.token, { type: 'TASK', title: 'B', dueDate: new Date(Date.now() + 2 * H).toISOString() });
      await createObj(u.token, { type: 'TASK', title: 'C', dueDate: new Date(Date.now() + 3 * H).toISOString() });
      await service.scanAndCreate(new Date());

      let l = await list(u.token);
      expect(l.unreadCount).toBe(3);
      expect((await http.get('/api/v1/notifications/unread-count').set(auth(u.token)).expect(200)).body.unreadCount).toBe(3);

      await http.patch(`/api/v1/notifications/${l.items[0].id}/read`).set(auth(u.token)).expect(200);
      expect((await list(u.token, true)).items).toHaveLength(2);

      await http.delete(`/api/v1/notifications/${l.items[1].id}`).set(auth(u.token)).expect(200);
      l = await list(u.token);
      expect(l.items).toHaveLength(2);

      await http.patch('/api/v1/notifications/read-all').set(auth(u.token)).expect(200);
      expect((await list(u.token)).unreadCount).toBe(0);
    });

    it('người khác không đọc / đánh dấu / xoá được thông báo của mình; read-all chỉ ảnh hưởng của mình', async () => {
      const a = await newUser();
      const b = await newUser();
      await createObj(a.token, { type: 'TASK', title: 'Của A', dueDate: new Date(Date.now() + H).toISOString() });
      await createObj(b.token, { type: 'TASK', title: 'Của B', dueDate: new Date(Date.now() + H).toISOString() });
      await service.scanAndCreate(new Date());

      const aItems = (await list(a.token)).items;
      const bItems = (await list(b.token)).items;
      expect(aItems.every((i) => !bItems.some((x) => x.id === i.id))).toBe(true);

      await http.patch(`/api/v1/notifications/${aItems[0].id}/read`).set(auth(b.token)).expect(404);
      await http.delete(`/api/v1/notifications/${aItems[0].id}`).set(auth(b.token)).expect(404);

      await http.patch('/api/v1/notifications/read-all').set(auth(b.token)).expect(200);
      expect((await list(a.token)).unreadCount).toBeGreaterThan(0);
      await http.get('/api/v1/notifications').expect(401);
    });

    it('phát thông báo hệ thống: gửi cho mọi người dùng không bị khoá, không gửi lặp', async () => {
      const ok = await newUser();
      const locked = await newUser();
      await prisma.user.update({ where: { id: locked.id }, data: { lockedAt: new Date() } });

      const n1 = await service.broadcast('Bảo trì', 'Hệ thống bảo trì lúc 22:00', 'batch-1');
      const n2 = await service.broadcast('Bảo trì', 'Hệ thống bảo trì lúc 22:00', 'batch-1');
      expect(n1).toBeGreaterThan(0);
      expect(n2).toBe(0);
      expect((await list(ok.token)).items.filter((i) => i.type === 'SYSTEM')).toHaveLength(1);
      expect(await prisma.notification.count({ where: { userId: locked.id } })).toBe(0);
    });
  });
});
