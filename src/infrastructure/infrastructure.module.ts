import { Module } from '@nestjs/common';
import { PrismaModule } from './database/prisma.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  exports: [PrismaModule, RedisModule],
})
export class InfrastructureModule {}
