import 'source-map-support/register';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as Sentry from '@sentry/node';
import { json } from 'body-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  Sentry.init({
    debug: process.env.NODE_ENV !== 'production',
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
  });

  app.enableCors();
  app.use(
    json({
      verify: (req: any, res, buf, encoding) => {
        // important to store rawBody for Astra signature verification
        if (req.headers['astra-verification'] && Buffer.isBuffer(buf)) {
          req.rawBody = buf.toString('utf-8');
        }
        return true;
      },
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
