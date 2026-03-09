import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RegisterEmailHandler } from '@modules/auth/application/use-case/register-email/register-email.handler';
import { RegisterEmailInput } from '@modules/auth/application/use-case/register-email/register-email.dto';
import { VerifyOtpHandler } from '@modules/auth/application/use-case/verify-otp/verify-otp.handler';
import { VerifyOtpInput } from '@modules/auth/application/use-case/verify-otp/verify-otp.dto';
import { ResendOtpHandler } from '@modules/auth/application/use-case/resend-otp/resend-otp.handler';
import { ResendOtpInput } from '@modules/auth/application/use-case/resend-otp/resend-otp.dto';
import { CreateAccountHandler } from '@modules/auth/application/use-case/create-account/create-account.handler';
import { CreateAccountInput } from '@modules/auth/application/use-case/create-account/create-account.dto';
import { LoginHandler } from '@modules/auth/application/use-case/login/login.handler';
import { LoginInput } from '@modules/auth/application/use-case/login/login.dto';
import { RefreshTokenHandler } from '@modules/auth/application/use-case/refresh-token/refresh-token.handler';
import { RefreshTokenInput } from '@modules/auth/application/use-case/refresh-token/refresh-token.dto';
import { LogoutHandler } from '@modules/auth/application/use-case/logout/logout.handler';
import { LogoutInput } from '@modules/auth/application/use-case/logout/logout.dto';
import { JwtAuthGuard } from '@modules/auth/presentation/guard/jwt-auth.guard';
import { RefreshTokenGuard } from '@modules/auth/presentation/guard/refresh-token.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerEmailHandler: RegisterEmailHandler,
    private readonly verifyOtpHandler: VerifyOtpHandler,
    private readonly resendOtpHandler: ResendOtpHandler,
    private readonly createAccountHandler: CreateAccountHandler,
    private readonly loginHandler: LoginHandler,
    private readonly refreshTokenHandler: RefreshTokenHandler,
    private readonly logoutHandler: LogoutHandler,
  ) {}

  @Post('register-email')
  @HttpCode(HttpStatus.OK)
  registerEmail(@Body() dto: RegisterEmailInput) {
    return this.registerEmailHandler.execute(dto);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  verifyOtp(@Body() dto: VerifyOtpInput) {
    return this.verifyOtpHandler.execute(dto);
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  resendOtp(@Body() dto: ResendOtpInput) {
    return this.resendOtpHandler.execute(dto);
  }

  @Post('create-account')
  @HttpCode(HttpStatus.CREATED)
  createAccount(@Body() dto: CreateAccountInput) {
    return this.createAccountHandler.execute(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginInput) {
    return this.loginHandler.execute(dto);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshTokenInput) {
    return this.refreshTokenHandler.execute(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Body() dto: LogoutInput) {
    return this.logoutHandler.execute(dto);
  }
}
