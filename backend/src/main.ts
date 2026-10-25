import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Header bảo mật (API trả JSON nên tắt CSP để không cản Swagger UI)
  app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Global exception filter (TECH-04)
  app.useGlobalFilters(new AllExceptionsFilter());

  // CORS for Next.js frontend
  app.enableCors({
    // Nhiều địa chỉ cách nhau bằng dấu phẩy, ví dụ: CORS_ORIGIN=https://app.example.com,http://localhost:3000
    origin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000').split(',').map((o) => o.trim()),
    credentials: true,
    exposedHeaders: ['X-Total-Count'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger Documentation tại /api/docs (TECH-03, NFR-MAIN-02)
  const config = new DocumentBuilder()
    .setTitle('Study & Work Manager API')
    .setDescription('Tài liệu đặc tả API Hệ thống Quản lý Học tập và Công việc Cá nhân')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Nhập JWT access token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Backend server is running on: http://localhost:${port}/api/v1`);
  console.log(`Swagger documentation is available at: http://localhost:${port}/api/docs`);
}
bootstrap();
