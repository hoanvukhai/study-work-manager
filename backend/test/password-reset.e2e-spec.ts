import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/prisma/prisma.service';
import { MailMessage, MailService } from '../src/mail/mail.service';
import { FORGOT_PASSWORD_MESSAGE } from '../src/auth/auth.service';

describe('Quên / đặt lại mật khẩu (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let http: ReturnType<typeof request>;
  const outbox: MailMessage[] = [];

  const register = (email: string) =>
    http.post('/api/v1/auth/register').send({ email, password: 'Password123!', fullName: 'Người Quên' }).expect(201);
  const forgot = (email: string) => http.post('/api/v1/auth/forgot-password').send({ email });
  const reset = (token: string, newPassword: string) => http.post('/api/v1/auth/reset-password').send({ token, newPassword });
  const login = (email: string, password: string) => http.post('/api/v1/auth/login').send({ email, password });
  const tokenFrom = (mail: MailMessage) => /token=([0-9a-f]{64})/.exec(mail.text)![1];
  const lastMailTo = (email: string) => [...outbox].reverse().find((m) => m.to === email);

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(MailService)
      .useValue({ isConfigured: true, send: async (m: MailMessage) => void outbox.push(m) })
      .compile();
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

  it('email có thật và không có thật đều nhận cùng một phản hồi; chỉ email có thật nhận thư', async () => {
    await register('pw1@test.local');
    const before = outbox.length;

    const real = await forgot('pw1@test.local').expect(200);
    const fake = await forgot('khong-co@test.local').expect(200);
    expect(real.body).toEqual({ message: FORGOT_PASSWORD_MESSAGE });
    expect(fake.body).toEqual(real.body);
    expect(outbox.length).toBe(before + 1);
    expect(outbox[outbox.length - 1].to).toBe('pw1@test.local');
    expect(outbox[outbox.length - 1].text).toContain('/reset-password?token=');
  });

  it('đặt lại thành công: mật khẩu cũ hết hiệu lực, mật khẩu mới đăng nhập được', async () => {
    await register('pw2@test.local');
    await forgot('pw2@test.local').expect(200);
    const token = tokenFrom(lastMailTo('pw2@test.local')!);

    await reset(token, 'MatKhauMoi456!').expect(200);
    await login('pw2@test.local', 'Password123!').expect(401);
    await login('pw2@test.local', 'MatKhauMoi456!').expect(200);
  });

  it('token chỉ dùng được một lần', async () => {
    await register('pw3@test.local');
    await forgot('pw3@test.local').expect(200);
    const token = tokenFrom(lastMailTo('pw3@test.local')!);

    await reset(token, 'MatKhauMoi456!').expect(200);
    const again = await reset(token, 'MatKhauKhac789!').expect(400);
    expect(again.body.message).toContain('không hợp lệ hoặc đã hết hạn');
    await login('pw3@test.local', 'MatKhauMoi456!').expect(200);
  });

  it('token hết hạn bị từ chối', async () => {
    await register('pw4@test.local');
    await forgot('pw4@test.local').expect(200);
    const token = tokenFrom(lastMailTo('pw4@test.local')!);
    const user = await prisma.user.findUnique({ where: { email: 'pw4@test.local' } });
    await prisma.passwordReset.updateMany({ where: { userId: user!.id }, data: { expiresAt: new Date(Date.now() - 1000) } });

    await reset(token, 'MatKhauMoi456!').expect(400);
    await login('pw4@test.local', 'Password123!').expect(200);
  });

  it('yêu cầu mới vô hiệu hoá liên kết cũ chưa dùng', async () => {
    await register('pw5@test.local');
    await forgot('pw5@test.local').expect(200);
    const oldToken = tokenFrom(lastMailTo('pw5@test.local')!);
    await forgot('pw5@test.local').expect(200);
    const newToken = tokenFrom(lastMailTo('pw5@test.local')!);
    expect(newToken).not.toBe(oldToken);

    await reset(oldToken, 'MatKhauMoi456!').expect(400);
    await reset(newToken, 'MatKhauMoi456!').expect(200);
  });

  it('CSDL chỉ lưu băm của token, không lưu token gốc', async () => {
    await register('pw6@test.local');
    await forgot('pw6@test.local').expect(200);
    const token = tokenFrom(lastMailTo('pw6@test.local')!);
    const user = await prisma.user.findUnique({ where: { email: 'pw6@test.local' } });
    const rows = await prisma.passwordReset.findMany({ where: { userId: user!.id } });
    expect(rows).toHaveLength(1);
    expect(rows[0].tokenHash).not.toBe(token);
    expect(JSON.stringify(rows)).not.toContain(token);
  });

  it('token sai định dạng hoặc không tồn tại; mật khẩu mới quá ngắn', async () => {
    await reset('abc', 'MatKhauMoi456!').expect(400);
    await reset('x'.repeat(64), 'MatKhauMoi456!').expect(400); // đủ dài nhưng không phải hex
    await reset('0'.repeat(64), 'MatKhauMoi456!').expect(400); // đúng định dạng, không tồn tại

    await register('pw7@test.local');
    await forgot('pw7@test.local').expect(200);
    const token = tokenFrom(lastMailTo('pw7@test.local')!);
    await reset(token, '1234567').expect(400);
    await reset(token, 'MatKhauMoi456!').expect(200); // lần nhập sai không làm cháy token
  });

  it('đặt lại mật khẩu cũng gỡ khoá tạm do nhập sai nhiều lần', async () => {
    await register('pw8@test.local');
    for (let i = 0; i < 5; i++) await login('pw8@test.local', 'sai').expect(401);
    await login('pw8@test.local', 'Password123!').expect(401); // đang khoá tạm

    await forgot('pw8@test.local').expect(200);
    await reset(tokenFrom(lastMailTo('pw8@test.local')!), 'MatKhauMoi456!').expect(200);
    await login('pw8@test.local', 'MatKhauMoi456!').expect(200);
  });

  it('tài khoản bị Admin khoá không nhận thư đặt lại; email sai định dạng bị từ chối', async () => {
    const u = await register('pw9@test.local');
    await prisma.user.update({ where: { id: u.body.user.id }, data: { lockedAt: new Date() } });
    const before = outbox.length;
    await forgot('pw9@test.local').expect(200);
    expect(outbox.length).toBe(before);

    await forgot('khong-phai-email').expect(400);
  });
});
