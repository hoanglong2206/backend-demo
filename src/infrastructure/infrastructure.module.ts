import { Module } from '@nestjs/common';
import { PrismaModule } from './database/prisma.module';
import { RedisModule } from './redis/redis.module';
import { QueueModule } from './queue/queue.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [PrismaModule, RedisModule, QueueModule, CloudinaryModule],
  exports: [PrismaModule, RedisModule, QueueModule, CloudinaryModule],
})
export class InfrastructureModule {}
