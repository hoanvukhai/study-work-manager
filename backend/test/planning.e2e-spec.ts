import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';

describe('Trụ Kế hoạch (e2e) — phụ thuộc, việc con, gợi ý hôm nay', () => {
  let app: INestApplication;
  let http: ReturnType<typeof request>;
  let token: string;
  let tokenOther: string;

  const auth = (t: string) => ({ Authorization: `Bearer ${t}` });

  async function register(email: string) {
    const res = await http
      .post('/api/v1/auth/register')
      .send({ email, password: 'Password123!', fullName: 'Người Dùng Kế Hoạch' })
      .expect(201);
    return res.body.accessToken as string;
  }

  async function createObj(body: Record<string, unknown>, t = token) {
    return (await http.post('/api/v1/objects').set(auth(t)).send(body).expect(201)).body;
  }

  const link = (from: string, to: string, relationType: string, t = token) =>
    http.post('/api/v1/relations').set(auth(t)).send({ fromObjectId: from, toObjectId: to, relationType });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
    await app.init();
    http = request(app.getHttpServer());
    token = await register('plan1@test.local');
    tokenOther = await register('plan2@test.local');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Phụ thuộc DEPENDS_ON', () => {
    it('cấm tạo vòng phụ thuộc trực tiếp và gián tiếp (A→B→C→A)', async () => {
      const a = (await createObj({ type: 'TASK', title: 'A' })).id;
      const b = (await createObj({ type: 'TASK', title: 'B' })).id;
      const c = (await createObj({ type: 'TASK', title: 'C' })).id;

      await link(a, b, 'DEPENDS_ON').expect(201);
      await link(b, c, 'DEPENDS_ON').expect(201);

      const direct = await link(b, a, 'DEPENDS_ON').expect(400);
      expect(direct.body.message).toContain('vòng phụ thuộc');
      await link(c, a, 'DEPENDS_ON').expect(400);
      await link(a, c, 'DEPENDS_ON').expect(201); // đường tắt vẫn là đồ thị không vòng
    });

    it('chỉ áp dụng giữa các Task (Note/Event/Reference bị từ chối)', async () => {
      const t = (await createObj({ type: 'TASK', title: 'T' })).id;
      const n = (await createObj({ type: 'NOTE', title: 'N' })).id;
      await link(t, n, 'DEPENDS_ON').expect(400);
      await link(n, t, 'PARENT_OF').expect(400);
      await link(t, n, 'REFERENCES').expect(201); // các loại khác giữa Task–Note vẫn được
    });
  });

  describe('Việc con PARENT_OF', () => {
    it('một việc chỉ có một việc cha và không có vòng cha–con', async () => {
      const p1 = (await createObj({ type: 'TASK', title: 'Cha 1' })).id;
      const p2 = (await createObj({ type: 'TASK', title: 'Cha 2' })).id;
      const child = (await createObj({ type: 'TASK', title: 'Con' })).id;

      await link(p1, child, 'PARENT_OF').expect(201);
      const second = await link(p2, child, 'PARENT_OF').expect(400);
      expect(second.body.message).toContain('đã có một việc cha');

      const cycle = await link(child, p1, 'PARENT_OF').expect(400);
      expect(cycle.body.message).toContain('vòng cha');
    });
  });

  describe('GET /planning/overview', () => {
    it('việc bị chặn không được gợi ý; xong tiền đề thì được mở khoá', async () => {
      const prereq = (await createObj({ type: 'TASK', title: 'Tiền đề X' })).id;
      const next = (await createObj({ type: 'TASK', title: 'Việc cần chờ X', priority: 'URGENT' })).id;
      await link(next, prereq, 'DEPENDS_ON').expect(201);

      const before = (await http.get('/api/v1/planning/overview').set(auth(token)).expect(200)).body;
      expect(before.suggestions.some((s: { id: string }) => s.id === next)).toBe(false);
      const blocked = before.blocked.find((b: { id: string }) => b.id === next);
      expect(blocked.waitingFor.map((w: { id: string }) => w.id)).toEqual([prereq]);
      const prereqSuggestion = before.suggestions.find((s: { id: string }) => s.id === prereq);
      expect(prereqSuggestion.reasons).toContain('Mở khoá 1 việc khác');

      await http.patch(`/api/v1/objects/${prereq}`).set(auth(token)).send({ status: 'DONE' }).expect(200);

      const after = (await http.get('/api/v1/planning/overview').set(auth(token)).expect(200)).body;
      expect(after.suggestions.some((s: { id: string }) => s.id === next)).toBe(true);
      expect(after.blocked.some((b: { id: string }) => b.id === next)).toBe(false);
    });

    it('việc đã huỷ/ở Thùng rác không tính là tiền đề đang chặn', async () => {
      const prereq = (await createObj({ type: 'TASK', title: 'Tiền đề bị bỏ' })).id;
      const next = (await createObj({ type: 'TASK', title: 'Việc chờ tiền đề bị bỏ' })).id;
      await link(next, prereq, 'DEPENDS_ON').expect(201);
      await http.patch(`/api/v1/objects/${prereq}/lifecycle`).set(auth(token)).send({ action: 'TRASH' }).expect(200);

      const res = (await http.get('/api/v1/planning/overview').set(auth(token)).expect(200)).body;
      expect(res.blocked.some((b: { id: string }) => b.id === next)).toBe(false);
    });

    it('thời gian ước lượng cộng vào mức tải; Note không có thời gian ước lượng', async () => {
      const due = new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString();
      const t = await createObj({ type: 'TASK', title: 'Có ước lượng', dueDate: due, estimatedMinutes: 90 });
      expect(t.estimatedMinutes).toBe(90);
      const note = await createObj({ type: 'NOTE', title: 'Ghi chú', estimatedMinutes: 30 });
      expect(note.estimatedMinutes).toBeNull();

      const res = (await http.get('/api/v1/planning/overview').set(auth(token)).expect(200)).body;
      expect(res.workload.plannedMinutes).toBeGreaterThanOrEqual(90);
      await http.patch(`/api/v1/objects/${t.id}`).set(auth(token)).send({ estimatedMinutes: 0 }).expect(400);
    });

    it('người dùng khác không thấy việc của mình trong gợi ý', async () => {
      const mine = await createObj({ type: 'TASK', title: 'Riêng tư của plan1' });
      const other = (await http.get('/api/v1/planning/overview').set(auth(tokenOther)).expect(200)).body;
      expect(other.suggestions.some((s: { id: string }) => s.id === mine.id)).toBe(false);
      expect(other.blocked).toEqual([]);
      await http.get('/api/v1/planning/overview').expect(401);
    });
  });
});
