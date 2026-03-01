import { Module, Type } from '@nestjs/common';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController as Type<HealthController>],
})
export class HealthModule {}
