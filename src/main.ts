import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';
import {
  ResponseTransformInterceptor,
  LoggingInterceptor,
  TimeoutInterceptor,
} from '@shared/core/interceptors';
import {
  DomainExceptionFilter,
  GlobalExceptionFilter,
} from '@shared/core/filters';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const port = configService.get<number>('app.port', 3000);
  const apiPrefix = configService.get<string>('app.apiPrefix', 'api');
  const apiDefaultVersion = configService.get<string>(
    'app.apiDefaultVersion',
    '1',
  );
  const corsOrigins = configService.get<string[]>('app.corsOrigins', [
    'http://localhost:3000',
  ]);

  // Security middleware — sets various HTTP headers for basic protection
  app.use(helmet());

  app.enableCors({
    origin: corsOrigins,
    credentials: true, // Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization'],
  });

  // Set global API prefix and versioning
  app.setGlobalPrefix(apiPrefix);

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: apiDefaultVersion,
  });

  // Global validation pipe — validates ALL incoming DTOs automatically
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties not in the DTO
      forbidNonWhitelisted: true, // Throw error if unknown properties sent
      transform: true, // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Convert query string "5" → number 5
      },
    }),
  );

  //  Global response interceptor — wraps ALL responses in a standard envelope
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TimeoutInterceptor(),
    new ResponseTransformInterceptor(),
  );

  // Global exception filters — DomainException first, then catch-all
  app.useGlobalFilters(
    new GlobalExceptionFilter(),
    new DomainExceptionFilter(),
  );

  app.enableShutdownHooks();

  await app.listen(port);

  console.log(
    `🚀 Server running on http://localhost:${port}/${apiPrefix}/v${apiDefaultVersion}`,
  );
}
void bootstrap();
