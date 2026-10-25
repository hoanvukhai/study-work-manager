import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/prisma/prisma.service';

const D = 24 * 3600 * 1000;

describe('Báo cáo tuần (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let http: ReturnType<typeof request>;
  let counter = 0;

  const auth = (t: string) => ({ Authorization: `Bearer ${t}` });
  async function newUser() {
    counter += 1;
    const res = await http
      .post('/api/v1/auth/register')
      .send({ email: `rep${counter}@test.local`, password: 'Password123!', fullName: 'Người Báo Cáo' })
      .expect(201);
    return { token: res.body.accessToken as string, id: res.body.user.id as string };
  }
  const create = async (t: string, body: Record<string, unknown>) => (await http.post('/api/v1/objects').set(auth(t)).send(body).expect(201)).body;
  const report = async (t: string, offset = 0) => (await http.get(`/api/v1/reports/weekly?offset=${offset}`).set(auth(t)).expect(200)).body;
  const setStatus = (t: string, id: string, status: string) => http.patch(`/api/v1/objects/${id}`).set(auth(t)).send({ status }).expect(200);

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
    await app.init();
    prisma = app.get(PrismaService);
    http = request(app.getHttpServer());
  });

  afterAll(async () => {
    await app.close();
  });

  it('báo cáo trống cho người dùng mới; tuần có đủ 7 ngày bắt đầu từ thứ Hai', async () => {
    const u = await newUser();
    const r = await report(u.token);
    expect(r.tasks).toMatchObject({ completed: 0, created: 0, dueInWeek: 0, onTimeRate: null });
    expect(r.study).toMatchObject({ reviews: 0, minutes: 0, retentionRate: null, activeDays: 0 });
    expect(r.days).toHaveLength(7);
    expect(new Date(`${r.weekStart}T12:00:00Z`).getUTCDay()).toBe(1); // thứ Hai
    expect(new Date(`${r.weekEnd}T12:00:00Z`).getUTCDay()).toBe(0); // Chủ nhật
    expect(r.isCurrentWeek).toBe(true);
  });

  it('việc vừa xong được tính vào hôm nay; mở lại thì không còn tính (completedAt được xoá)', async () => {
    const u = await newUser();
    const t = await create(u.token, { type: 'TASK', title: 'Xong rồi' });
    await setStatus(u.token, t.id, 'DONE');

    let r = await report(u.token);
    expect(r.tasks.completed).toBe(1);
    expect(r.tasks.created).toBe(1);
    expect(r.days.reduce((s: number, d: { tasksCompleted: number }) => s + d.tasksCompleted, 0)).toBe(1);
    expect((await prisma.object.findUnique({ where: { id: t.id } }))!.completedAt).not.toBeNull();

    await setStatus(u.token, t.id, 'TODO');
    r = await report(u.token);
    expect(r.tasks.completed).toBe(0);
    expect((await prisma.object.findUnique({ where: { id: t.id } }))!.completedAt).toBeNull();
  });

  it('sửa tiêu đề việc đã xong không làm dịch chuyển thời điểm hoàn thành sang tuần khác', async () => {
    const u = await newUser();
    const t = await create(u.token, { type: 'TASK', title: 'Cũ' });
    await setStatus(u.token, t.id, 'DONE');
    await prisma.object.update({ where: { id: t.id }, data: { completedAt: new Date(Date.now() - 9 * D) } }); // tuần trước
    await http.patch(`/api/v1/objects/${t.id}`).set(auth(u.token)).send({ title: 'Mới' }).expect(200);

    expect((await report(u.token, 0)).tasks.completed).toBe(0);
    expect((await report(u.token, 1)).tasks.completed).toBe(1);
  });

  it('tỉ lệ đúng hạn và so với tuần trước', async () => {
    const u = await newUser();
    const early = await create(u.token, { type: 'TASK', title: 'Xong sớm', dueDate: new Date(Date.now() + 3 * D).toISOString() });
    const late = await create(u.token, { type: 'TASK', title: 'Xong trễ', dueDate: new Date(Date.now() + 3 * D).toISOString() });
    await setStatus(u.token, early.id, 'DONE');
    await setStatus(u.token, late.id, 'DONE');
    await prisma.object.update({ where: { id: late.id }, data: { dueDate: new Date(Date.now() - D) } }); // hạn đã qua trước lúc xong

    for (let i = 0; i < 3; i++) {
      const t = await create(u.token, { type: 'TASK', title: `Tuần trước ${i}` });
      await setStatus(u.token, t.id, 'DONE');
      await prisma.object.update({ where: { id: t.id }, data: { completedAt: new Date(Date.now() - 8 * D) } });
    }

    const r = await report(u.token);
    expect(r.tasks.completed).toBe(2);
    expect(r.tasks.onTimeRate).toBe(50);
    expect(r.vsPreviousWeek.tasksCompleted).toBe(2 - 3);
  });

  it('thống kê học tập: lượt ôn, tỉ lệ nhớ, phút tập trung, số ngày hoạt động', async () => {
    const u = await newUser();
    const note = await create(u.token, { type: 'NOTE', title: 'Học', description: 'A :: 1\nB :: 2\nC :: 3\nD :: 4' });
    await http.post(`/api/v1/study/notes/${note.id}/sync-cards`).set(auth(u.token)).expect(200);
    const cards = (await http.get('/api/v1/study/due?limit=10').set(auth(u.token)).expect(200)).body.cards;
    const grades = ['GOOD', 'EASY', 'AGAIN', 'GOOD'];
    for (let i = 0; i < 4; i++) {
      await http.post(`/api/v1/study/cards/${cards[i].id}/review`).set(auth(u.token)).send({ grade: grades[i] }).expect(200);
    }
    await http.post('/api/v1/study/sessions').set(auth(u.token)).send({ minutes: 25 }).expect(201);

    const r = await report(u.token);
    expect(r.study.reviews).toBe(4);
    expect(r.study.retentionRate).toBe(75);
    expect(r.study.minutes).toBe(25);
    expect(r.study.activeDays).toBe(1);
    expect(r.vsPreviousWeek.reviews).toBe(4);
    expect(r.vsPreviousWeek.minutes).toBe(25);
  });

  it('thống kê theo Không gian chỉ gồm việc đã xong trong tuần', async () => {
    const u = await newUser();
    const space = (await http.post('/api/v1/spaces').set(auth(u.token)).send({ name: 'Đồ án' }).expect(201)).body.id;
    for (const title of ['a', 'b']) {
      const t = await create(u.token, { type: 'TASK', title, spaceId: space });
      await setStatus(u.token, t.id, 'DONE');
    }
    await create(u.token, { type: 'TASK', title: 'chưa xong', spaceId: space });
    const r = await report(u.token);
    expect(r.topSpaces).toEqual([expect.objectContaining({ name: 'Đồ án', completed: 2 })]);
  });

  it('cách ly dữ liệu giữa người dùng; kiểm tra tham số', async () => {
    const a = await newUser();
    const b = await newUser();
    const t = await create(a.token, { type: 'TASK', title: 'Của A' });
    await setStatus(a.token, t.id, 'DONE');
    expect((await report(b.token)).tasks.completed).toBe(0);

    await http.get('/api/v1/reports/weekly?offset=-1').set(auth(a.token)).expect(400);
    await http.get('/api/v1/reports/weekly?offset=9999').set(auth(a.token)).expect(400);
    await http.get('/api/v1/reports/weekly').expect(401);
  });
});
