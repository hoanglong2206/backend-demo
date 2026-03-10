import { Provider } from '@nestjs/common';

// Repository implementations
import { PrismaUserCredentialRepository } from '../persistence/repositories/prisma-user-credential.repository';
import { PrismaRefreshTokenRepository } from '../persistence/repositories/prisma-refresh-token.repository';

// Cache implementations
import { RedisOtpCacheService } from '../cache/redis-otp-cache.service';

// Service implementations
import { BcryptPasswordHasherService } from '../security/bcrypt-password-hasher.service';
import { JwtTokenGeneratorService } from '../security/jwt-token-generator.service';
import { NodemailerEmailSenderService } from '../email/nodemailer-email-sender.service';

/**
 * Binds domain interface tokens to their infrastructure implementations.
 *
 * These providers are imported by AuthModule and allow use-case handlers
 * to depend on abstract interfaces via @Inject('ITokenName') while
 * NestJS resolves the concrete Prisma / Redis / Bcrypt / JWT implementations.
 */
export const authProviders: Provider[] = [
  // ── Repositories ──
  {
    provide: 'IUserCredentialRepository',
    useClass: PrismaUserCredentialRepository,
  },
  {
    provide: 'IRefreshTokenRepository',
    useClass: PrismaRefreshTokenRepository,
  },

  // ── Cache ──
  {
    provide: 'IOtpCacheService',
    useClass: RedisOtpCacheService,
  },

  // ── Domain services ──
  {
    provide: 'IPasswordHasherService',
    useClass: BcryptPasswordHasherService,
  },
  {
    provide: 'ITokenGeneratorService',
    useClass: JwtTokenGeneratorService,
  },

  // ── Infrastructure services ──
  NodemailerEmailSenderService,
];
