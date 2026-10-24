import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Trụ Tri thức (e2e) — liên kết [[ ]], backlink, bản đồ', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let http: ReturnType<typeof request>;
  let token: string;
  let tokenOther: string;

  const auth = (t: string) => ({ Authorization: `Bearer ${t}` });

  async function register(email: string) {
    return (
      await http.post('/api/v1/auth/register').send({ email, password: 'Password123!', fullName: 'Người Ghi Chú' }).expect(201)
    ).body.accessToken as string;
  }

  async function create(body: Record<string, unknown>, t = token) {
    return (await http.post('/api/v1/objects').set(auth(t)).send(body).expect(201)).body;
  }

  const relationsOf = async (id: string, t = token) =>
    (await http.get(`/api/v1/relations/object/${id}`).set(auth(t)).expect(200)).body;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
    await app.init();
    prisma = app.get(PrismaService);
    http = request(app.getHttpServer());
    token = await register('know1@test.local');
    tokenOther = await register('know2@test.local');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Liên kết nhanh [[Tiêu đề]]', () => {
    it('tạo liên kết tự động khi tạo mục có nhắc tới mục khác (không phân biệt hoa thường)', async () => {
      const target = await create({ type: 'NOTE', title: 'Lý thuyết JWT' });
      const source = await create({ type: 'TASK', title: 'Viết Auth', description: 'Đọc [[lý thuyết jwt]] trước' });

      const rel = await relationsOf(source.id);
      expect(rel.outgoing).toHaveLength(1);
      expect(rel.outgoing[0].toObjectId).toBe(target.id);
      expect(rel.outgoing[0].relationType).toBe('RELATES_TO');
      expect(rel.outgoing[0].auto).toBe(true);

      // backlink: mục được nhắc thấy liên kết đi vào
      const back = await relationsOf(target.id);
      expect(back.incoming.map((r: { fromObjectId: string }) => r.fromObjectId)).toEqual([source.id]);
    });

    it('sửa nội dung: thêm nhắc thì thêm liên kết, bỏ nhắc thì xoá liên kết tự động', async () => {
      const a = await create({ type: 'NOTE', title: 'Mục A' });
      const b = await create({ type: 'NOTE', title: 'Mục B' });
      const src = await create({ type: 'NOTE', title: 'Nguồn', description: 'Có [[Mục A]]' });
      expect((await relationsOf(src.id)).outgoing.map((r: { toObjectId: string }) => r.toObjectId)).toEqual([a.id]);

      await http.patch(`/api/v1/objects/${src.id}`).set(auth(token)).send({ description: 'Giờ chỉ có [[Mục B]]' }).expect(200);
      expect((await relationsOf(src.id)).outgoing.map((r: { toObjectId: string }) => r.toObjectId)).toEqual([b.id]);

      await http.patch(`/api/v1/objects/${src.id}`).set(auth(token)).send({ description: 'Hết nhắc' }).expect(200);
      expect((await relationsOf(src.id)).outgoing).toHaveLength(0);
    });

    it('liên kết tạo tay không bị xoá khi bỏ nhắc; nhắc trùng liên kết tay thì giữ bản tay', async () => {
      const x = await create({ type: 'NOTE', title: 'Mục X' });
      const src = await create({ type: 'NOTE', title: 'Nguồn tay' });
      await http
        .post('/api/v1/relations')
        .set(auth(token))
        .send({ fromObjectId: src.id, toObjectId: x.id, relationType: 'RELATES_TO' })
        .expect(201);

      await http.patch(`/api/v1/objects/${src.id}`).set(auth(token)).send({ description: 'Nhắc [[Mục X]]' }).expect(200);
      let rel = (await relationsOf(src.id)).outgoing;
      expect(rel).toHaveLength(1);
      expect(rel[0].auto).toBe(false); // vẫn là bản tay

      await http.patch(`/api/v1/objects/${src.id}`).set(auth(token)).send({ description: 'Hết nhắc' }).expect(200);
      rel = (await relationsOf(src.id)).outgoing;
      expect(rel).toHaveLength(1); // không bị xoá
    });

    it('không tự liên kết với chính mình; mục không tồn tại hoặc trong Thùng rác thì bỏ qua', async () => {
      const trashed = await create({ type: 'NOTE', title: 'Đã vứt' });
      await http.patch(`/api/v1/objects/${trashed.id}/lifecycle`).set(auth(token)).send({ action: 'TRASH' }).expect(200);
      const src = await create({
        type: 'NOTE',
        title: 'Tự nhắc',
        description: 'Nhắc [[Tự nhắc]], [[Không có mục này]], [[Đã vứt]]',
      });
      expect((await relationsOf(src.id)).outgoing).toHaveLength(0);
    });

    it('không bao giờ liên kết tới mục cùng tiêu đề của người dùng khác', async () => {
      await create({ type: 'NOTE', title: 'Tiêu đề chung' }, tokenOther);
      const src = await create({ type: 'NOTE', title: 'Nguồn của tôi', description: '[[Tiêu đề chung]]' });
      expect((await relationsOf(src.id)).outgoing).toHaveLength(0);
      expect(await prisma.objectRelation.count({ where: { fromObjectId: src.id } })).toBe(0);
    });

    it('trùng tiêu đề trong cùng tài khoản: nối tới mục mới cập nhật nhất', async () => {
      await create({ type: 'NOTE', title: 'Trùng tên' });
      await new Promise((r) => setTimeout(r, 30));
      const newer = await create({ type: 'NOTE', title: 'Trùng tên' });
      const src = await create({ type: 'NOTE', title: 'Nguồn trùng', description: '[[Trùng tên]]' });
      expect((await relationsOf(src.id)).outgoing.map((r: { toObjectId: string }) => r.toObjectId)).toEqual([newer.id]);
    });
  });

  describe('Bản đồ tri thức GET /knowledge/graph', () => {
    it('trả các mục đang hoạt động và liên kết giữa chúng; không có mục Thùng rác/Lưu trữ', async () => {
      const a = await create({ type: 'TASK', title: 'G-Task' });
      const b = await create({ type: 'NOTE', title: 'G-Note' });
      const gone = await create({ type: 'NOTE', title: 'G-Gone' });
      const arch = await create({ type: 'NOTE', title: 'G-Archived' });
      await http.post('/api/v1/relations').set(auth(token)).send({ fromObjectId: a.id, toObjectId: b.id, relationType: 'REFERENCES' }).expect(201);
      await http.post('/api/v1/relations').set(auth(token)).send({ fromObjectId: a.id, toObjectId: gone.id, relationType: 'RELATES_TO' }).expect(201);
      await http.patch(`/api/v1/objects/${gone.id}/lifecycle`).set(auth(token)).send({ action: 'TRASH' }).expect(200);
      await http.patch(`/api/v1/objects/${arch.id}/lifecycle`).set(auth(token)).send({ action: 'ARCHIVE' }).expect(200);

      const g = (await http.get('/api/v1/knowledge/graph').set(auth(token)).expect(200)).body;
      const ids = g.nodes.map((n: { id: string }) => n.id);
      expect(ids).toEqual(expect.arrayContaining([a.id, b.id]));
      expect(ids).not.toContain(gone.id);
      expect(ids).not.toContain(arch.id);
      expect(g.edges.some((e: { from: string; to: string }) => e.from === a.id && e.to === b.id)).toBe(true);
      // cạnh dẫn tới mục đã bỏ khỏi đồ thị không được xuất hiện
      expect(g.edges.every((e: { from: string; to: string }) => ids.includes(e.from) && ids.includes(e.to))).toBe(true);
      expect(g.truncated).toBe(false);
    });

    it('lọc theo Space', async () => {
      const space = (await http.post('/api/v1/spaces').set(auth(token)).send({ name: 'Graph Space' }).expect(201)).body.id;
      const inside = await create({ type: 'NOTE', title: 'Trong Space', spaceId: space });
      const outside = await create({ type: 'NOTE', title: 'Ngoài Space' });
      const g = (await http.get(`/api/v1/knowledge/graph?spaceId=${space}`).set(auth(token)).expect(200)).body;
      const ids = g.nodes.map((n: { id: string }) => n.id);
      expect(ids).toContain(inside.id);
      expect(ids).not.toContain(outside.id);
    });

    it('người dùng khác không thấy nút hay cạnh của mình; cần đăng nhập; spaceId sai định dạng bị từ chối', async () => {
      const mine = await create({ type: 'NOTE', title: 'Bản đồ riêng tư' });
      const other = (await http.get('/api/v1/knowledge/graph').set(auth(tokenOther)).expect(200)).body;
      expect(other.nodes.some((n: { id: string }) => n.id === mine.id)).toBe(false);
      await http.get('/api/v1/knowledge/graph').expect(401);
      await http.get('/api/v1/knowledge/graph?spaceId=abc').set(auth(token)).expect(400);
    });
  });
});
