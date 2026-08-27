import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { ConfigService } from '@nestjs/config';

// Global serialization patching for Prisma BigInt IDs
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable Global API Prefix to match Laravel route mappings (e.g. /api/login)
  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);
  const frontendUrl = configService.get<string>('FRONTEND_URL');

  // Enable CORS for frontend connectivity
  app.enableCors({
    origin: frontendUrl
      ? [frontendUrl, frontendUrl.replace(/\/$/, ''), 'http://localhost:3000']
      : true,
    credentials: true,
  });

  // Enable Global Validation Pipe for request bodies
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Enable Custom Error Formatting Filter to match Laravel response payload schemas
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = configService.get<number>('PORT') || 8000;

  await app.listen(port, '0.0.0.0');
  console.log(`PAGE NestJS Backend running on: http://localhost:${port}/api`);
}
bootstrap();
