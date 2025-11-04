import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { join } from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const uploadsDir = join(process.cwd(), process.env.LOCAL_UPLOAD_DIR ?? 'uploads');
  app.use('/static', express.static(uploadsDir));

  app.use(
    helmet({
      // If we serve images across domains and hit CSP/CORP issues, we can tweak options here.
    }),
  );

  // CORS (adjust to your deployment)
  app.enableCors({
    origin: [/^https?:\/\/localhost:\d+$/i, /\.yourdomain\.com$/i],
    methods: ['GET', 'POST'],
    credentials: false,
  });

  // Throttle uploads (per IP)
  app.use(
    '/images',
    rateLimit({
      windowMs: 60_000,
      max: 20,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  const config = new DocumentBuilder().setTitle('Images API').setVersion('1.0').build();
  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, doc);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
