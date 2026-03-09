import { Module } from '@nestjs/common';
import { AppConfigModule } from '@shared/core/config/config.module';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { HealthModule } from '@modules/health/health.module';
import { AuthModule } from '@modules/auth/auth.module';

@Module({
  imports: [AppConfigModule, InfrastructureModule, HealthModule, AuthModule],
})
export class AppModule {}
