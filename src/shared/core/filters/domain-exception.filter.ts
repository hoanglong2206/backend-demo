import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { DomainException } from '@shared/common/kernel/domain-exception';
import { DOMAIN_ERROR_STATUS_MAP } from '@shared/core/constants';

/**
 * Maps DomainExceptions to structured HTTP error responses.
 *
 * WHY: Domain exceptions are business-rule violations (e.g., account locked,
 * invalid credentials). They are not NestJS HTTP exceptions, so they won't
 * be caught by the default exception handler. This filter bridges the gap
 * without polluting the domain layer with HTTP concerns.
 *
 * Domain code → HTTP status mapping:
 *   AUTH_INVALID_CREDENTIALS      → 401
 *   AUTH_ACCOUNT_LOCKED           → 403
 *   AUTH_TOKEN_REUSE_DETECTED     → 401
 *   AUTH_EMAIL_ALREADY_VERIFIED   → 409
 *   AUTH_OTP_EXPIRED              → 400
 *   AUTH_OTP_MAX_ATTEMPTS         → 429
 *   AUTH_OTP_RESEND_COOLDOWN      → 429
 *   (any other DomainException)   → 422
 */
@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: DomainException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      DOMAIN_ERROR_STATUS_MAP[exception.code] ??
      HttpStatus.UNPROCESSABLE_ENTITY;

    this.logger.warn(
      `DomainException [${exception.code}]: ${exception.message}`,
    );

    response.status(status).json({
      success: false,
      error: {
        code: exception.code,
        message: exception.message,
      },
      meta: {
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    });
  }
}
