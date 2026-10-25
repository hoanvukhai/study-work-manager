import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';

describe('Danh sách Object (e2e) — giới hạn, bỏ qua, tổng số', () => {
  let app: INestApplication;
  let http: ReturnType<typeof request>;
  let token: string;
  const auth = () => ({ Authorization: `Bearer ${token}` });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
    await app.init();
    http = request(app.getHttpServer());
    token = (await http.post('/api/v1/auth/register').send({ email: 'list1@test.local', password: 'Password123!', fullName: 'Người Liệt Kê' }).expect(201)).body.accessToken;
    for (let i = 1; i <= 7; i++) {
      await http.post('/api/v1/objects').set(auth()).send({ type: 'NOTE', title: `Mục ${i}` }).expect(201);
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it('trả header X-Total-Count là tổng số mục khớp, không phụ thuộc limit', async () => {
    const r = await http.get('/api/v1/objects?limit=3').set(auth()).expect(200);
    expect(r.body).toHaveLength(3);
    expect(r.headers['x-total-count']).toBe('7');
  });

  it('offset bỏ qua đúng số mục và không trùng với trang trước', async () => {
    const p1 = (await http.get('/api/v1/objects?limit=3&offset=0').set(auth()).expect(200)).body.map((o: { id: string }) => o.id);
    const p2 = (await http.get('/api/v1/objects?limit=3&offset=3').set(auth()).expect(200)).body.map((o: { id: string }) => o.id);
    const p3 = (await http.get('/api/v1/objects?limit=3&offset=6').set(auth()).expect(200)).body.map((o: { id: string }) => o.id);
    expect(p3).toHaveLength(1);
    expect(new Set([...p1, ...p2, ...p3]).size).toBe(7);
  });

  it('tổng số tính theo bộ lọc (tìm kiếm)', async () => {
    const r = await http.get('/api/v1/objects').query({ search: 'Mục 1' }).set(auth()).expect(200);
    expect(r.headers['x-total-count']).toBe('1');
  });

  it('từ chối limit vượt 500, limit = 0, offset âm', async () => {
    await http.get('/api/v1/objects?limit=501').set(auth()).expect(400);
    await http.get('/api/v1/objects?limit=0').set(auth()).expect(400);
    await http.get('/api/v1/objects?offset=-1').set(auth()).expect(400);
  });

  it('mặc định vẫn trả đủ khi ít hơn giới hạn', async () => {
    const r = await http.get('/api/v1/objects').set(auth()).expect(200);
    expect(r.body).toHaveLength(7);
  });
});
