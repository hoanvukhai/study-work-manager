import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';
import { sanitizeSettings } from '../src/space/spaces.service';

describe('Space (e2e) — tiến độ, ghim, sắp xếp, công cụ', () => {
  let app: INestApplication;
  let http: ReturnType<typeof request>;
  let token: string;
  let tokenOther: string;

  const auth = (t: string) => ({ Authorization: `Bearer ${t}` });

  async function register(email: string) {
    return (await http.post('/api/v1/auth/register').send({ email, password: 'Password123!', fullName: 'Người Dùng Space' }).expect(201))
      .body.accessToken as string;
  }
  const mkSpace = async (name: string, t = token, extra: Record<string, unknown> = {}) =>
    (await http.post('/api/v1/spaces').set(auth(t)).send({ name, ...extra }).expect(201)).body.id as string;
  const mkObj = async (body: Record<string, unknown>, t = token) =>
    (await http.post('/api/v1/objects').set(auth(t)).send(body).expect(201)).body.id as string;
  const placements = async (spaceId: string) =>
    (await http.get(`/api/v1/objects?spaceId=${spaceId}`).set(auth(token)).expect(200)).body.map(
      (o: { id: string; spaceObjects: { spaceId: string; position: number; isPinned: boolean }[] }) => ({
        ...o.spaceObjects.find((s) => s.spaceId === spaceId)!,
        id: o.id, // đặt sau cùng: bản ghi gán cũng có trường id riêng
      }),
    ) as { id: string; position: number; isPinned: boolean }[];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
    await app.init();
    http = request(app.getHttpServer());
    token = await register('space1@test.local');
    tokenOther = await register('space2@test.local');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Tiến độ', () => {
    it('tính done/total chỉ trên Task đang hoạt động, bỏ việc đã huỷ và mục trong Thùng rác', async () => {
      const space = await mkSpace('Tiến độ');
      const t1 = await mkObj({ type: 'TASK', title: 'Xong', status: 'DONE', spaceId: space });
      await mkObj({ type: 'TASK', title: 'Đang làm', status: 'IN_PROGRESS', spaceId: space });
      await mkObj({ type: 'TASK', title: 'Cần làm', spaceId: space });
      await mkObj({ type: 'TASK', title: 'Đã huỷ', status: 'CANCELLED', spaceId: space });
      const trashed = await mkObj({ type: 'TASK', title: 'Trong rác', status: 'DONE', spaceId: space });
      await mkObj({ type: 'NOTE', title: 'Ghi chú không tính', spaceId: space });
      await http.patch(`/api/v1/objects/${trashed}/lifecycle`).set(auth(token)).send({ action: 'TRASH' }).expect(200);

      const s = (await http.get(`/api/v1/spaces/${space}`).set(auth(token)).expect(200)).body;
      expect(s.progress).toEqual({ done: 1, total: 3 });

      await http.patch(`/api/v1/objects/${t1}`).set(auth(token)).send({ status: 'TODO' }).expect(200);
      expect((await http.get(`/api/v1/spaces/${space}`).set(auth(token))).body.progress).toEqual({ done: 0, total: 3 });
    });

    it('Không gian rỗng có progress 0/0; người khác không xem được (404)', async () => {
      const space = await mkSpace('Rỗng');
      expect((await http.get(`/api/v1/spaces/${space}`).set(auth(token)).expect(200)).body.progress).toEqual({ done: 0, total: 0 });
      await http.get(`/api/v1/spaces/${space}`).set(auth(tokenOther)).expect(404);
    });
  });

  describe('Mục tiêu và hạn chót của Space', () => {
    it('tạo và sửa goal + dueDate; xoá bằng null/rỗng', async () => {
      const due = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
      const space = await mkSpace('Có mục tiêu', token, { goal: 'Bảo vệ xuất sắc', dueDate: due });
      let s = (await http.get(`/api/v1/spaces/${space}`).set(auth(token)).expect(200)).body;
      expect(s.goal).toBe('Bảo vệ xuất sắc');
      expect(new Date(s.dueDate).getTime()).toBe(new Date(due).getTime());

      await http.patch(`/api/v1/spaces/${space}`).set(auth(token)).send({ goal: '', dueDate: null }).expect(200);
      s = (await http.get(`/api/v1/spaces/${space}`).set(auth(token)).expect(200)).body;
      expect(s.goal).toBeNull();
      expect(s.dueDate).toBeNull();
    });
  });

  describe('Ghim và sắp xếp', () => {
    it('ghim một mục chỉ ảnh hưởng Space đó (mục nằm ở 2 Space)', async () => {
      const a = await mkSpace('Ghim A');
      const b = await mkSpace('Ghim B');
      const obj = await mkObj({ type: 'NOTE', title: 'Mục đa Space', spaceId: a });
      await http.post(`/api/v1/objects/${obj}/spaces/${b}`).set(auth(token)).expect(201);

      const res = await http.patch(`/api/v1/spaces/${a}/objects/${obj}`).set(auth(token)).send({ isPinned: true }).expect(200);
      expect(res.body.isPinned).toBe(true);
      expect((await placements(a))[0].isPinned).toBe(true);
      expect((await placements(b))[0].isPinned).toBe(false);
    });

    it('đặt lại thứ tự theo danh sách gửi lên', async () => {
      const space = await mkSpace('Sắp xếp');
      const ids = [await mkObj({ type: 'NOTE', title: '1', spaceId: space }), await mkObj({ type: 'NOTE', title: '2', spaceId: space }), await mkObj({ type: 'NOTE', title: '3', spaceId: space })];
      const reversed = [...ids].reverse();
      await http.post(`/api/v1/spaces/${space}/reorder`).set(auth(token)).send({ objectIds: reversed }).expect(200);

      const sorted = (await placements(space)).sort((x, y) => x.position - y.position).map((p) => p.id);
      expect(sorted).toEqual(reversed);
    });

    it('từ chối khi danh sách có mục không thuộc Space, trùng lặp, hoặc sai định dạng', async () => {
      const space = await mkSpace('Kiểm tra sắp xếp');
      const inside = await mkObj({ type: 'NOTE', title: 'Trong', spaceId: space });
      const outside = await mkObj({ type: 'NOTE', title: 'Ngoài' });
      await http.post(`/api/v1/spaces/${space}/reorder`).set(auth(token)).send({ objectIds: [inside, outside] }).expect(400);
      await http.post(`/api/v1/spaces/${space}/reorder`).set(auth(token)).send({ objectIds: [inside, inside] }).expect(400);
      await http.post(`/api/v1/spaces/${space}/reorder`).set(auth(token)).send({ objectIds: ['abc'] }).expect(400);
      await http.patch(`/api/v1/spaces/${space}/objects/${inside}`).set(auth(token)).send({ position: -1 }).expect(400);
    });

    it('người khác không ghim / sắp xếp được trong Space của mình, kể cả khi biết id', async () => {
      const space = await mkSpace('Riêng tư');
      const obj = await mkObj({ type: 'NOTE', title: 'Của tôi', spaceId: space });
      await http.patch(`/api/v1/spaces/${space}/objects/${obj}`).set(auth(tokenOther)).send({ isPinned: true }).expect(404);
      await http.post(`/api/v1/spaces/${space}/reorder`).set(auth(tokenOther)).send({ objectIds: [obj] }).expect(404);

      // Space của người khác + mục của mình
      const otherSpace = await mkSpace('Space người khác', tokenOther);
      await http.patch(`/api/v1/spaces/${otherSpace}/objects/${obj}`).set(auth(tokenOther)).send({ isPinned: true }).expect(404);
      expect((await placements(space))[0].isPinned).toBe(false);
    });

    it('ghim mục không nằm trong Space → 404', async () => {
      const space = await mkSpace('Trống');
      const loose = await mkObj({ type: 'NOTE', title: 'Chưa gán' });
      await http.patch(`/api/v1/spaces/${space}/objects/${loose}`).set(auth(token)).send({ isPinned: true }).expect(404);
    });
  });

  describe('Công cụ bật/tắt (settings)', () => {
    it('lưu cờ công cụ hợp lệ, gộp với giá trị cũ, bỏ khoá lạ và giá trị không phải boolean', async () => {
      const space = await mkSpace('Công cụ', token, { settings: { enableKanban: false, haha: true } });
      let s = (await http.get(`/api/v1/spaces/${space}`).set(auth(token)).expect(200)).body;
      expect(s.settings).toEqual({ enableKanban: false });

      await http.patch(`/api/v1/spaces/${space}`).set(auth(token)).send({ settings: { enableCalendar: false, enableProgress: 'yes' } }).expect(200);
      s = (await http.get(`/api/v1/spaces/${space}`).set(auth(token)).expect(200)).body;
      expect(s.settings).toEqual({ enableKanban: false, enableCalendar: false });
    });

    it('sanitizeSettings: mặc định rỗng, không nhận giá trị lạ', () => {
      expect(sanitizeSettings(undefined)).toEqual({});
      expect(sanitizeSettings(null, { enableKanban: true })).toEqual({ enableKanban: true });
      expect(sanitizeSettings({ enableKanban: 1, x: 1 }, {})).toEqual({});
    });
  });
});
