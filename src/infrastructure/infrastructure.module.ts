import { Module } from '@nestjs/common';
import { PrismaModule } from './database/prisma.module';
import { RedisModule } from './redis/redis.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [PrismaModule, RedisModule, QueueModule],
  exports: [PrismaModule, RedisModule, QueueModule],
})
export class InfrastructureModule {}
