import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './app.config';
import { databaseConfig } from './database.config';
import { authConfig } from './auth.config';
import { mailConfig } from './mail.config';
import { redisConfig } from './redis.config';
import { queueConfig } from './queue.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        authConfig,
        mailConfig,
        redisConfig,
        queueConfig,
      ],
      envFilePath: ['.env'],
    }),
  ],
})
export class AppConfigModule {}
