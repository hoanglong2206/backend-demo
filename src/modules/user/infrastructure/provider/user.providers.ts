import { Provider } from '@nestjs/common';

// Repository implementations
import { PrismaUserProfileRepository } from '../persistence/repositories/prisma-user-profile.repository';
import { PrismaUserSettingsRepository } from '../persistence/repositories/prisma-user-settings.repository';

// Token-generator implementation (reused from auth infrastructure)
import { JwtTokenGeneratorService } from '@modules/auth/infrastructure/security/jwt-token-generator.service';

/**
 * Binds domain interface tokens to their infrastructure implementations.
 *
 * These providers are imported by UserModule and allow use-case handlers
 * to depend on abstract interfaces via @Inject('ITokenName') while
 * NestJS resolves the concrete Prisma / JWT implementations.
 */
export const userProviders: Provider[] = [
  // ── Repositories ──
  {
    provide: 'IUserProfileRepository',
    useClass: PrismaUserProfileRepository,
  },
  {
    provide: 'IUserSettingsRepository',
    useClass: PrismaUserSettingsRepository,
  },

  // ── Token generator (used by JwtAuthGuard) ──
  {
    provide: 'ITokenGeneratorService',
    useClass: JwtTokenGeneratorService,
  },
];
