import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { authProviders } from './infrastructure/provider/auth.providers';

// Guards
import { JwtAuthGuard } from './presentation/guard/jwt-auth.guard';
import { RefreshTokenGuard } from './presentation/guard/refresh-token.guard';

// Use-case handlers
import { RegisterEmailHandler } from './application/use-case/register-email/register-email.handler';
import { VerifyOtpHandler } from './application/use-case/verify-otp/verify-otp.handler';
import { ResendOtpHandler } from './application/use-case/resend-otp/resend-otp.handler';
import { CreateAccountHandler } from './application/use-case/create-account/create-account.handler';
import { LoginHandler } from './application/use-case/login/login.handler';
import { RefreshTokenHandler } from './application/use-case/refresh-token/refresh-token.handler';
import { LogoutHandler } from './application/use-case/logout/logout.handler';

// Controller
import { AuthController } from './presentation/http/auth.controller';

@Module({
  imports: [
    InfrastructureModule,
    JwtModule.register({}), // secrets supplied per-call by JwtTokenGeneratorService
  ],
  controllers: [AuthController],
  providers: [
    ...authProviders,

    // Guards
    JwtAuthGuard,
    RefreshTokenGuard,

    // Use-case handlers
    RegisterEmailHandler,
    VerifyOtpHandler,
    ResendOtpHandler,
    CreateAccountHandler,
    LoginHandler,
    RefreshTokenHandler,
    LogoutHandler,
  ],
})
export class AuthModule {}
