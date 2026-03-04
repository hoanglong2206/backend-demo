import { Module } from '@nestjs/common';
import { AppConfigModule } from './shared/core/config/config.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [AppConfigModule, InfrastructureModule, HealthModule],
})
export class AppModule {}
