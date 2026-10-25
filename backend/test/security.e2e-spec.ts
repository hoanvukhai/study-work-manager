// Giới hạn đăng nhập THẬT cho file test này: phải đặt trước khi nạp AppModule (đọc lúc khai báo controller)
process.env.THROTTLE_AUTH_LIMIT = '40';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import helmet from 'helmet';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { LOGIN_FAILED_MESSAGE, MAX_FAILED_LOGINS } from '../src/auth/auth.service';

describe('Bảo mật đăng nhập (e2e) — khoá tạm, giới hạn tần suất, header', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let http: ReturnType<typeof request>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));
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

  const register = (email: string) =>
    http.post('/api/v1/auth/register').send({ email, password: 'Password123!', fullName: 'Người Thử' });
  const login = (email: string, password: string) => http.post('/api/v1/auth/login').send({ email, password });

  it(`sai mật khẩu ${5} lần thì bị khoá tạm; đúng mật khẩu trong lúc khoá vẫn bị từ chối, cùng một thông báo`, async () => {
    await register('lock1@test.local').expect(201);
    for (let i = 0; i < MAX_FAILED_LOGINS; i++) {
      const r = await login('lock1@test.local', 'sai-mat-khau').expect(401);
      expect(r.body.message).toBe(LOGIN_FAILED_MESSAGE);
    }
    const user = await prisma.user.findUnique({ where: { email: 'lock1@test.local' } });
    expect(user!.lockoutUntil!.getTime()).toBeGreaterThan(Date.now());

    const correct = await login('lock1@test.local', 'Password123!').expect(401);
    expect(correct.body.message).toBe(LOGIN_FAILED_MESSAGE);
  });

  it('hết thời gian khoá thì đăng nhập lại được và bộ đếm được đặt lại', async () => {
    await register('lock2@test.local').expect(201);
    for (let i = 0; i < MAX_FAILED_LOGINS; i++) await login('lock2@test.local', 'sai').expect(401);
    await prisma.user.update({ where: { email: 'lock2@test.local' }, data: { lockoutUntil: new Date(Date.now() - 1000) } });

    await login('lock2@test.local', 'Password123!').expect(200);
    const user = await prisma.user.findUnique({ where: { email: 'lock2@test.local' } });
    expect(user!.failedLoginCount).toBe(0);
    expect(user!.lockoutUntil).toBeNull();
  });

  it('đăng nhập đúng xen giữa các lần sai thì bộ đếm được đặt lại (không khoá oan)', async () => {
    await register('lock3@test.local').expect(201);
    for (let i = 0; i < MAX_FAILED_LOGINS - 1; i++) await login('lock3@test.local', 'sai').expect(401);
    await login('lock3@test.local', 'Password123!').expect(200);
    for (let i = 0; i < MAX_FAILED_LOGINS - 1; i++) await login('lock3@test.local', 'sai').expect(401);
    await login('lock3@test.local', 'Password123!').expect(200);
  });

  it('email không tồn tại trả đúng cùng thông báo như sai mật khẩu (không lộ tài khoản)', async () => {
    const r = await login('khong-ton-tai@test.local', 'x'.repeat(10)).expect(401);
    expect(r.body.message).toBe(LOGIN_FAILED_MESSAGE);
  });

  it('khoá tạm do nhập sai không ảnh hưởng tài khoản khác', async () => {
    await register('other1@test.local').expect(201);
    await login('other1@test.local', 'Password123!').expect(200);
  });

  it('giới hạn tần suất: vượt số lần cho phép trên endpoint đăng nhập thì bị 429', async () => {
    let got429 = false;
    for (let i = 0; i < 60 && !got429; i++) {
      const r = await login('rate@test.local', 'x'.repeat(10));
      if (r.status === 429) got429 = true;
    }
    expect(got429).toBe(true);
  });

  it('có header bảo mật của helmet và không lộ X-Powered-By', async () => {
    const r = await http.get('/api/v1/objects');
    expect(r.headers['x-powered-by']).toBeUndefined();
    expect(r.headers['x-content-type-options']).toBe('nosniff');
    expect(r.headers['x-frame-options']).toBeDefined();
  });
});
