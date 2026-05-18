import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { HelpersModule } from './helpers/helpers.module';
import { SetDatabaseMiddleware } from './middlewares/set-database.middleware';
import { CloudinaryModule } from './common/cloudinary/cloudinary.module';
import { MulterModule } from '@nestjs/platform-express';
import { SecondaryPrismaModule } from './prisma/prisma-auth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { IntegrationModule } from './common/integration/integration.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    SecondaryPrismaModule,
    HelpersModule,
    MulterModule.register({}),
    CloudinaryModule,
    ScheduleModule.forRoot(),
    IntegrationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SetDatabaseMiddleware)
      .forRoutes('*');
  }
}
