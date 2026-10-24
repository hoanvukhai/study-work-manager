import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Trụ Học tập (e2e) — thẻ hỏi–đáp, SM-2, phiên học', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let http: ReturnType<typeof request>;
  let token: string;
  let tokenOther: string;

  const auth = (t: string) => ({ Authorization: `Bearer ${t}` });

  async function register(email: string) {
    return (
      await http
        .post('/api/v1/auth/register')
        .send({ email, password: 'Password123!', fullName: 'Người Học' })
        .expect(201)
    ).body.accessToken as string;
  }

  async function createNote(description: string, t = token, title = 'Ghi chú học') {
    return (await http.post('/api/v1/objects').set(auth(t)).send({ type: 'NOTE', title, description }).expect(201)).body;
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
    token = await register('study1@test.local');
    tokenOther = await register('study2@test.local');
  });

  afterAll(async () => {
    await app.close();
  });

  it('đồng bộ thẻ từ Note: tạo, cập nhật đáp án, xoá thẻ không còn trong nội dung', async () => {
    const note = await createNote('JWT là gì? :: Token ký số\n- Bcrypt để làm gì? :: Băm mật khẩu');
    const first = await http.post(`/api/v1/study/notes/${note.id}/sync-cards`).set(auth(token)).expect(200);
    expect(first.body).toEqual({ created: 2, updated: 0, removed: 0, total: 2 });

    // sửa đáp án một thẻ, xoá thẻ kia, thêm thẻ mới
    await http
      .patch(`/api/v1/objects/${note.id}`)
      .set(auth(token))
      .send({ description: 'JWT là gì? :: Chuỗi token đã ký\nSalt là gì? :: Chuỗi ngẫu nhiên' })
      .expect(200);
    const second = await http.post(`/api/v1/study/notes/${note.id}/sync-cards`).set(auth(token)).expect(200);
    expect(second.body).toEqual({ created: 1, updated: 1, removed: 1, total: 2 });

    const cards = (await http.get(`/api/v1/study/notes/${note.id}/cards`).set(auth(token)).expect(200)).body;
    expect(cards.map((c: { front: string }) => c.front).sort()).toEqual(['JWT là gì?', 'Salt là gì?']);
  });

  it('đồng bộ lại không làm mất tiến độ ôn của thẻ đã có', async () => {
    const note = await createNote('Q1 :: A1');
    await http.post(`/api/v1/study/notes/${note.id}/sync-cards`).set(auth(token)).expect(200);
    const due = (await http.get('/api/v1/study/due').set(auth(token)).expect(200)).body;
    const card = due.cards.find((c: { front: string }) => c.front === 'Q1');
    await http.post(`/api/v1/study/cards/${card.id}/review`).set(auth(token)).send({ grade: 'GOOD' }).expect(200);

    await http.post(`/api/v1/study/notes/${note.id}/sync-cards`).set(auth(token)).expect(200);
    const after = await prisma.flashcard.findUnique({ where: { id: card.id } });
    expect(after!.repetitions).toBe(1);
    expect(after!.intervalDays).toBe(1);
  });

  it('chỉ tạo thẻ từ Note (Task bị từ chối)', async () => {
    const task = (await http.post('/api/v1/objects').set(auth(token)).send({ type: 'TASK', title: 'T', description: 'A :: B' }).expect(201)).body;
    await http.post(`/api/v1/study/notes/${task.id}/sync-cards`).set(auth(token)).expect(400);
  });

  it('ôn thẻ: chấm Nhớ thì thẻ hết hạn ôn; chấm Quên thì hiện lại sau 10 phút', async () => {
    const note = await createNote('Hỏi A :: Đáp A\nHỏi B :: Đáp B');
    await http.post(`/api/v1/study/notes/${note.id}/sync-cards`).set(auth(token)).expect(200);
    const due = (await http.get('/api/v1/study/due?limit=100').set(auth(token)).expect(200)).body;
    const a = due.cards.find((c: { front: string }) => c.front === 'Hỏi A');
    const b = due.cards.find((c: { front: string }) => c.front === 'Hỏi B');
    expect(a.previewMinutes.AGAIN).toBe(10);
    expect(a.previewMinutes.GOOD).toBe(24 * 60);

    const good = (await http.post(`/api/v1/study/cards/${a.id}/review`).set(auth(token)).send({ grade: 'GOOD' }).expect(200)).body;
    expect(good.intervalDays).toBe(1);
    const again = (await http.post(`/api/v1/study/cards/${b.id}/review`).set(auth(token)).send({ grade: 'AGAIN' }).expect(200)).body;
    const minutes = (new Date(again.dueAt).getTime() - Date.now()) / 60000;
    expect(minutes).toBeGreaterThan(8);
    expect(minutes).toBeLessThan(11);

    const dueAfter = (await http.get('/api/v1/study/due?limit=100').set(auth(token)).expect(200)).body;
    expect(dueAfter.cards.some((c: { id: string }) => c.id === a.id)).toBe(false);
    expect(dueAfter.cards.some((c: { id: string }) => c.id === b.id)).toBe(false);

    await http.post(`/api/v1/study/cards/${a.id}/review`).set(auth(token)).send({ grade: 'SAI' }).expect(400);
  });

  it('ôn theo ngữ cảnh: thẻ của Note liên kết với việc sắp đến hạn được xếp lên đầu', async () => {
    const plain = await createNote('Ngoài lề :: Không liên quan', token, 'Note thường');
    await new Promise((r) => setTimeout(r, 30)); // note sau có dueAt muộn hơn → nếu không có ưu tiên ngữ cảnh sẽ xếp sau
    const jwt = await createNote('JWT hết hạn mặc định? :: 7 ngày', token, 'Ghi chú JWT');
    await http.post(`/api/v1/study/notes/${plain.id}/sync-cards`).set(auth(token)).expect(200);
    await http.post(`/api/v1/study/notes/${jwt.id}/sync-cards`).set(auth(token)).expect(200);

    const dueDate = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
    const task = (await http.post('/api/v1/objects').set(auth(token)).send({ type: 'TASK', title: 'Viết module Auth', dueDate }).expect(201)).body;
    await http
      .post('/api/v1/relations')
      .set(auth(token))
      .send({ fromObjectId: task.id, toObjectId: jwt.id, relationType: 'REFERENCES' })
      .expect(201);

    const due = (await http.get('/api/v1/study/due?limit=100').set(auth(token)).expect(200)).body;
    const i = due.cards.findIndex((c: { front: string }) => c.front === 'JWT hết hạn mặc định?');
    const j = due.cards.findIndex((c: { front: string }) => c.front === 'Ngoài lề');
    expect(i).toBeGreaterThanOrEqual(0);
    expect(i).toBeLessThan(j);
    expect(due.cards[i].contextReason).toBe('Liên quan tới việc "Viết module Auth" sắp đến hạn');
    expect(due.cards[j].contextReason).toBeNull();
  });

  it('thẻ của Note trong Thùng rác không xuất hiện khi ôn', async () => {
    const note = await createNote('Rác :: Bỏ');
    await http.post(`/api/v1/study/notes/${note.id}/sync-cards`).set(auth(token)).expect(200);
    await http.patch(`/api/v1/objects/${note.id}/lifecycle`).set(auth(token)).send({ action: 'TRASH' }).expect(200);
    const due = (await http.get('/api/v1/study/due?limit=100').set(auth(token)).expect(200)).body;
    expect(due.cards.some((c: { front: string }) => c.front === 'Rác')).toBe(false);
  });

  it('người khác không đồng bộ, xem, ôn thẻ của mình (404) và không thấy thẻ trong danh sách ôn', async () => {
    const note = await createNote('Bí mật :: Đáp án bí mật');
    await http.post(`/api/v1/study/notes/${note.id}/sync-cards`).set(auth(token)).expect(200);
    const card = (await prisma.flashcard.findFirst({ where: { objectId: note.id } }))!;

    await http.post(`/api/v1/study/notes/${note.id}/sync-cards`).set(auth(tokenOther)).expect(404);
    await http.get(`/api/v1/study/notes/${note.id}/cards`).set(auth(tokenOther)).expect(404);
    await http.post(`/api/v1/study/cards/${card.id}/review`).set(auth(tokenOther)).send({ grade: 'GOOD' }).expect(404);
    const due = (await http.get('/api/v1/study/due').set(auth(tokenOther)).expect(200)).body;
    expect(due.cards).toEqual([]);
    expect(due.totalCards).toBe(0);
    await http.get('/api/v1/study/due').expect(401);
  });

  it('phiên học tập trung: ghi số phút, kiểm tra giới hạn, không gắn vào mục của người khác', async () => {
    const note = await createNote('x');
    await http.post('/api/v1/study/sessions').set(auth(token)).send({ minutes: 25, objectId: note.id }).expect(201);
    await http.post('/api/v1/study/sessions').set(auth(token)).send({ minutes: 0 }).expect(400);
    await http.post('/api/v1/study/sessions').set(auth(token)).send({ minutes: 999 }).expect(400);
    await http.post('/api/v1/study/sessions').set(auth(tokenOther)).send({ minutes: 25, objectId: note.id }).expect(404);
  });

  it('thống kê: số lượt ôn hôm nay, phút học, chuỗi ngày và 7 ngày gần nhất', async () => {
    const stats = (await http.get('/api/v1/study/stats').set(auth(token)).expect(200)).body;
    expect(stats.reviewedToday).toBeGreaterThanOrEqual(3);
    expect(stats.minutesToday).toBe(25);
    expect(stats.minutesWeek).toBe(25);
    expect(stats.streakDays).toBe(1);
    expect(stats.last7Days).toHaveLength(7);
    expect(stats.last7Days[6].minutes).toBe(25);

    const other = (await http.get('/api/v1/study/stats').set(auth(tokenOther)).expect(200)).body;
    expect(other).toMatchObject({ reviewedToday: 0, minutesToday: 0, streakDays: 0, totalCards: 0 });
  });

  it('CSDL chặn phiên học sai dù đi đường tắt (CHECK constraint)', async () => {
    const user = await prisma.user.findFirst({ where: { email: 'study1@test.local' } });
    await expect(
      prisma.$executeRawUnsafe(
        `INSERT INTO study_sessions (id, user_id, minutes) VALUES (gen_random_uuid(), '${user!.id}', 9999)`,
      ),
    ).rejects.toThrow();
  });
});
