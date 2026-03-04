import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';
import { ResponseTransformInterceptor } from './shared/core/interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const port = configService.get<number>('app.port', 3000);
  const apiPrefix = configService.get<string>('app.apiPrefix', 'api');
  const apiDefaultVersion = configService.get<string>(
    'app.apiDefaultVersion',
    '1',
  );

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
  app.useGlobalInterceptors(new ResponseTransformInterceptor());

  app.enableShutdownHooks();

  await app.listen(port);

  console.log(
    `🚀 Server running on http://localhost:${port}/${apiPrefix}/v${apiDefaultVersion}`,
  );
}
bootstrap();
