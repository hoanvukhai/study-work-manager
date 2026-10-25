import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Xuất dữ liệu cá nhân (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let http: ReturnType<typeof request>;
  let tokenA: string;
  let tokenB: string;
  const auth = (t: string) => ({ Authorization: `Bearer ${t}` });
  const create = async (t: string, body: Record<string, unknown>) => (await http.post('/api/v1/objects').set(auth(t)).send(body).expect(201)).body;

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
      (await http.post('/api/v1/auth/register').send({ email, password: 'Password123!', fullName: 'Người Xuất' }).expect(201)).body.accessToken as string;
    tokenA = await reg('exp1@test.local');
    tokenB = await reg('exp2@test.local');

    // Dữ liệu của A: Không gian, mục (kể cả Thùng rác), liên kết, thẻ ôn, phiên học
    const space = (await http.post('/api/v1/spaces').set(auth(tokenA)).send({ name: 'Không gian của A' }).expect(201)).body.id;
    const note = await create(tokenA, { type: 'NOTE', title: 'Ghi chú A', description: 'Q :: A', spaceId: space });
    const task = await create(tokenA, { type: 'TASK', title: 'Việc A' });
    const trashed = await create(tokenA, { type: 'NOTE', title: 'Trong rác của A' });
    await http.patch(`/api/v1/objects/${trashed.id}/lifecycle`).set(auth(tokenA)).send({ action: 'TRASH' }).expect(200);
    await http.post('/api/v1/relations').set(auth(tokenA)).send({ fromObjectId: task.id, toObjectId: note.id, relationType: 'REFERENCES' }).expect(201);
    await http.post(`/api/v1/study/notes/${note.id}/sync-cards`).set(auth(tokenA)).expect(200);
    await http.post('/api/v1/study/sessions').set(auth(tokenA)).send({ minutes: 25 }).expect(201);
    await http.get('/api/v1/calendar/feed-token').set(auth(tokenA)).expect(200); // tạo calendarToken
    await http.post('/api/v1/auth/forgot-password').send({ email: 'exp1@test.local' }).expect(200); // tạo bản ghi đặt lại mật khẩu

    await create(tokenB, { type: 'NOTE', title: 'Bí mật của B' });
  });

  afterAll(async () => {
    await app.close();
  });

  it('trả đủ dữ liệu của người dùng, kể cả mục trong Thùng rác, kèm tệp tải về', async () => {
    const res = await http.get('/api/v1/account/export').set(auth(tokenA)).expect(200);
    expect(res.headers['content-disposition']).toMatch(/^attachment; filename="study-work-export-\d{4}-\d{2}-\d{2}\.json"$/);
    const d = res.body;
    expect(d.format).toBe('study-work-manager-export');
    expect(d.version).toBe(1);
    expect(d.user.email).toBe('exp1@test.local');
    expect(d.counts).toEqual({ spaces: 1, objects: 3, relations: 1, flashcards: 1 });
    expect(d.objects.map((o: { title: string }) => o.title).sort()).toEqual(['Ghi chú A', 'Trong rác của A', 'Việc A']);
    expect(d.placements).toHaveLength(1);
    expect(d.studySessions).toHaveLength(1);
    expect(d.notificationSettings === null || typeof d.notificationSettings === 'object').toBe(true);
  });

  it('không chứa dữ liệu của người khác', async () => {
    const text = JSON.stringify((await http.get('/api/v1/account/export').set(auth(tokenA)).expect(200)).body);
    expect(text).not.toContain('Bí mật của B');
    expect(text).not.toContain('exp2@test.local');

    const b = (await http.get('/api/v1/account/export').set(auth(tokenB)).expect(200)).body;
    expect(b.counts).toEqual({ spaces: 0, objects: 1, relations: 0, flashcards: 0 });
    expect(JSON.stringify(b)).not.toContain('Ghi chú A');
  });

  it('không bao giờ chứa mật khẩu, token lịch hay token đặt lại mật khẩu', async () => {
    const text = JSON.stringify((await http.get('/api/v1/account/export').set(auth(tokenA)).expect(200)).body);
    const user = await prisma.user.findUnique({ where: { email: 'exp1@test.local' } });
    const reset = await prisma.passwordReset.findFirst({ where: { userId: user!.id } });
    expect(user!.calendarToken).toBeTruthy();
    expect(reset).toBeTruthy();

    expect(text).not.toContain(user!.passwordHash);
    expect(text).not.toContain(user!.calendarToken!);
    expect(text).not.toContain(reset!.tokenHash);
    for (const forbidden of ['passwordHash', 'calendarToken', 'tokenHash', 'lockoutUntil', 'failedLoginCount']) {
      expect(text).not.toContain(forbidden);
    }
  });

  it('phải đăng nhập mới tải được', async () => {
    await http.get('/api/v1/account/export').expect(401);
  });
});
