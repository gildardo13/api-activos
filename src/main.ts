import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ErrorInterceptor } from './common/interceptors/error.interceptors';
import * as cookieParser from 'cookie-parser';
import { NextFunction, Request } from 'express';
import { RequestContext } from './common/context/request-context';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new ErrorInterceptor());
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: [
      'http://localhost:5173', // compras
      'http://localhost:5174', // proveedores
      'http://localhost:3000', // auth
      'http://localhost:3001', // control activos (legacy)
      'http://localhost:4000', // control activos (nuevo)
      'http://localhost:4001', // admin
      'http://localhost:9001', // control documental
      'http://localhost:4002', // control activo
      'https://auth.jibby.mx',
      'https://activos.jibby.mx',
      'https://control-activos.jibby.mx',
      'https://admin.jibby.mx',
      'https://apicompras.cicsagruas.com',
      'https://procura.jibby.mx',
      'https://proveedores.jibby.mx',
      'https://docs.jibby.mx',
      'https://control-documental.jibby.mx',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'empresa', 'systemkey', 'organizationid', 'X-Is-Development'],
    exposedHeaders: ['x-new-access-token', 'X-Is-Development'], // si aún lo usas
  });

  const config = new DocumentBuilder()
    .setTitle('Multi-organization API')
    .setDescription('API para gestionar múltiples empresas y sistemas')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.use((req: Request, res: Response, next: NextFunction) => {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.socket.remoteAddress;

    const store = RequestContext.getStore() ?? new Map();
    store.set('ip', ip);
    store.set('route', req.originalUrl || req.url);
    store.set('httpMethod', req.method);

    try {
      if (req?.cookies?.user) {
        const userId = JSON.parse(req.cookies.user)?.state?.id;
        const staffId = JSON.parse(req.cookies.user)?.state?.organizations[0]
          ?.staffId;
        if (userId) {
          store.set('userId', userId);
          store.set('staffId', staffId);
        }
      }
    } catch (error) {
      // Ignorar el error si la cookie no es un JSON válido
    }

    RequestContext.run(store, () => next());
  });

  await app.listen(2100);
}

bootstrap();
