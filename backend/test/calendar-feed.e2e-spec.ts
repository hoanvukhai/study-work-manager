import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/prisma/prisma.service';

const D = 24 * 3600 * 1000;

describe('Xuất lịch .ics (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let http: ReturnType<typeof request>;
  let tokenA: string;
  let tokenB: string;

  const auth = (t: string) => ({ Authorization: `Bearer ${t}` });
  const create = async (t: string, body: Record<string, unknown>) => (await http.post('/api/v1/objects').set(auth(t)).send(body).expect(201)).body;
  const feedPath = async (t: string) => (await http.get('/api/v1/calendar/feed-token').set(auth(t)).expect(200)).body as { token: string; path: string };
  const getFeed = async (t: string) => (await http.get(`/api/v1${(await feedPath(t)).path}`).expect(200)).text;

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
      (await http.post('/api/v1/auth/register').send({ email, password: 'Password123!', fullName: 'Người Lịch' }).expect(201)).body.accessToken as string;
    tokenA = await reg('ics1@test.local');
    tokenB = await reg('ics2@test.local');
  });

  afterAll(async () => {
    await app.close();
  });

  it('token ổn định giữa các lần gọi, 64 ký tự hex; đường dẫn lịch công khai (không cần đăng nhập)', async () => {
    const a = await feedPath(tokenA);
    const again = await feedPath(tokenA);
    expect(a.token).toMatch(/^[0-9a-f]{64}$/);
    expect(again.token).toBe(a.token);
    expect((await feedPath(tokenB)).token).not.toBe(a.token);

    const res = await http.get(`/api/v1${a.path}`).expect(200);
    expect(res.headers['content-type']).toContain('text/calendar');
    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.text.startsWith('BEGIN:VCALENDAR')).toBe(true);
    await http.get('/api/v1/calendar/feed-token').expect(401); // lấy token thì phải đăng nhập
  });

  it('chứa Task chưa xong có hạn và Event; không chứa việc đã xong/huỷ, Thùng rác, Lưu trữ, Note, Tài liệu', async () => {
    const due = new Date(Date.now() + 2 * D).toISOString();
    await create(tokenA, { type: 'TASK', title: 'Việc mở', dueDate: due });
    await create(tokenA, { type: 'TASK', title: 'Việc xong', dueDate: due, status: 'DONE' });
    await create(tokenA, { type: 'TASK', title: 'Việc huỷ', dueDate: due, status: 'CANCELLED' });
    await create(tokenA, { type: 'TASK', title: 'Việc không hạn' });
    const trashed = await create(tokenA, { type: 'TASK', title: 'Việc trong rác', dueDate: due });
    const archived = await create(tokenA, { type: 'TASK', title: 'Việc lưu trữ', dueDate: due });
    await http.patch(`/api/v1/objects/${trashed.id}/lifecycle`).set(auth(tokenA)).send({ action: 'TRASH' }).expect(200);
    await http.patch(`/api/v1/objects/${archived.id}/lifecycle`).set(auth(tokenA)).send({ action: 'ARCHIVE' }).expect(200);
    await create(tokenA, { type: 'EVENT', title: 'Họp, nhóm; quan trọng', startAt: due, endAt: new Date(Date.now() + 2 * D + 3600000).toISOString() });
    await create(tokenA, { type: 'NOTE', title: 'Ghi chú không vào lịch' });
    await create(tokenA, { type: 'REFERENCE', title: 'Tài liệu không vào lịch', url: 'https://example.com' });

    const ics = await getFeed(tokenA);
    expect(ics).toContain('SUMMARY:Hạn: Việc mở');
    expect(ics).toContain('SUMMARY:Họp\\, nhóm\\; quan trọng');
    for (const hidden of ['Việc xong', 'Việc huỷ', 'Việc không hạn', 'Việc trong rác', 'Việc lưu trữ', 'Ghi chú không vào lịch', 'Tài liệu không vào lịch']) {
      expect(ics).not.toContain(hidden);
    }
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(ics).toContain('TRIGGER:-PT30M'); // nhắc trước 30 phút cho việc
    expect(ics).toContain('TRIGGER:-PT15M'); // nhắc trước 15 phút cho sự kiện
  });

  it('không lộ mô tả hay đường dẫn; không lộ dữ liệu của người dùng khác', async () => {
    const due = new Date(Date.now() + 3 * D).toISOString();
    await create(tokenB, { type: 'TASK', title: 'Việc riêng của B', description: 'MÔ-TẢ-BÍ-MẬT', dueDate: due });
    const icsB = await getFeed(tokenB);
    expect(icsB).toContain('Việc riêng của B');
    expect(icsB).not.toContain('MÔ-TẢ-BÍ-MẬT');

    const icsA = await getFeed(tokenA);
    expect(icsA).not.toContain('Việc riêng của B');
  });

  it('việc quá hạn quá 14 ngày hoặc xa hơn 1 năm không vào lịch', async () => {
    await create(tokenB, { type: 'TASK', title: 'Quá cũ', dueDate: new Date(Date.now() - 20 * D).toISOString() });
    await create(tokenB, { type: 'TASK', title: 'Quá xa', dueDate: new Date(Date.now() + 400 * D).toISOString() });
    await create(tokenB, { type: 'TASK', title: 'Vừa trễ', dueDate: new Date(Date.now() - 2 * D).toISOString() });
    const ics = await getFeed(tokenB);
    expect(ics).not.toContain('Quá cũ');
    expect(ics).not.toContain('Quá xa');
    expect(ics).toContain('Vừa trễ');
  });

  it('tạo lại token: địa chỉ cũ ngừng hoạt động, địa chỉ mới dùng được', async () => {
    const old = await feedPath(tokenA);
    const rotated = (await http.post('/api/v1/calendar/feed-token/rotate').set(auth(tokenA)).expect(201)).body;
    expect(rotated.token).not.toBe(old.token);
    await http.get(`/api/v1${old.path}`).expect(404);
    await http.get(`/api/v1${rotated.path}`).expect(200);
  });

  it('token sai, sai định dạng, hoặc thiếu đuôi .ics → 404; tài khoản bị khoá → 404', async () => {
    await http.get(`/api/v1/calendar/feed/${'0'.repeat(64)}.ics`).expect(404);
    await http.get('/api/v1/calendar/feed/abc.ics').expect(404);
    const { token } = await feedPath(tokenB);
    await http.get(`/api/v1/calendar/feed/${token}`).expect(404);

    const user = await prisma.user.findUnique({ where: { calendarToken: token } });
    await prisma.user.update({ where: { id: user!.id }, data: { lockedAt: new Date() } });
    await http.get(`/api/v1/calendar/feed/${token}.ics`).expect(404);
  });
});
