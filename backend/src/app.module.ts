import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SpacesModule } from './space/spaces.module';
import { ObjectsModule } from './object/objects.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    SpacesModule,
    ObjectsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

