import { HttpStatus } from '@nestjs/common';

/**
 * Maps domain exception codes to their corresponding HTTP status codes.
 *
 * Centralised here so every filter / middleware that needs to translate
 * a DomainException into an HTTP response uses the same mapping, rather
 * than duplicating it inline.
 */
export const DOMAIN_ERROR_STATUS_MAP: Readonly<Record<string, number>> = {
  // ── Auth ──────────────────────────────────────────────────────────────
  AUTH_INVALID_CREDENTIALS: HttpStatus.UNAUTHORIZED,
  AUTH_ACCOUNT_LOCKED: HttpStatus.FORBIDDEN,
  AUTH_TOKEN_REUSE_DETECTED: HttpStatus.UNAUTHORIZED,
  AUTH_EMAIL_ALREADY_VERIFIED: HttpStatus.CONFLICT,
  AUTH_OTP_EXPIRED: HttpStatus.BAD_REQUEST,
  AUTH_OTP_MAX_ATTEMPTS: HttpStatus.TOO_MANY_REQUESTS,
  AUTH_OTP_RESEND_COOLDOWN: HttpStatus.TOO_MANY_REQUESTS,
};
