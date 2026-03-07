import { BaseEntity } from '@shared/common/kernel/base.entity';
import { OtpCode } from '../value-objects/otp-code.vo';
import { EmailAlreadyVerifiedException } from '../exceptions/email-already-verified.exception';
import { OtpExpiredException } from '../exceptions/otp-expired.exception';
import { OtpMaxAttemptsException } from '../exceptions/otp-max-attempts.exception';
import { OtpResendCooldownException } from '../exceptions/otp-resend-cooldown.exception';

interface EmailVerificationProps {
  email: string;
  otpCode: OtpCode;
  verifiedAt: Date | null;
  ipAddress: string | null;
  userId: string;
}

/**
 * Entity representing an email verification request.
 *
 * WHY: Email verification is a distinct lifecycle (create → verify/expire)
 * with its own invariants separate from the user credential aggregate.
 * The OtpCode value object encapsulates the code value and expiry logic.
 */
export class EmailVerification extends BaseEntity {
  private _email: string;
  private _otpCode: OtpCode;
  private _verifiedAt: Date | null;
  private _ipAddress: string | null;
  private _userId: string;

  private static readonly MAX_VERIFICATION_ATTEMPTS = 5;
  private static readonly RESEND_COOLDOWN_SECONDS = 60;
  private _attempts: number;

  private constructor(
    id: string,
    props: EmailVerificationProps,
    createdAt?: Date,
    attempts = 0,
  ) {
    super(id, createdAt);
    this._email = props.email;
    this._otpCode = props.otpCode;
    this._verifiedAt = props.verifiedAt;
    this._ipAddress = props.ipAddress;
    this._userId = props.userId;
    this._attempts = attempts;
  }

  /**
   * Factory: create a new email verification request.
   * Generates a fresh OTP code with the default TTL.
   */
  static create(
    id: string,
    email: string,
    userId: string,
    ipAddress?: string | null,
    ttlMinutes?: number,
  ): EmailVerification {
    return new EmailVerification(id, {
      email,
      otpCode: OtpCode.generate(ttlMinutes),
      verifiedAt: null,
      ipAddress: ipAddress ?? null,
      userId,
    });
  }

  /**
   * Factory: reconstitute from persistence.
   */
  static reconstitute(
    id: string,
    props: EmailVerificationProps,
    createdAt: Date,
    attempts = 0,
  ): EmailVerification {
    return new EmailVerification(id, props, createdAt, attempts);
  }

  // ── Getters ───────────────────────────────────────────────

  get email(): string {
    return this._email;
  }

  get otpCode(): OtpCode {
    return this._otpCode;
  }

  get expiresAt(): Date {
    return this._otpCode.expiresAt;
  }

  get verifiedAt(): Date | null {
    return this._verifiedAt;
  }

  get ipAddress(): string | null {
    return this._ipAddress;
  }

  get userId(): string {
    return this._userId;
  }

  get attempts(): number {
    return this._attempts;
  }

  // ── Domain behaviour ──────────────────────────────────────

  /**
   * Whether the verification OTP has expired.
   */
  isExpired(): boolean {
    return this._otpCode.isExpired();
  }

  /**
   * Whether the email has already been verified.
   */
  isVerified(): boolean {
    return this._verifiedAt !== null;
  }

  /**
   * Verify the OTP code against the submitted input.
   * Enforces expiry, already-verified, and max-attempts rules.
   */
  verify(submittedCode: string): void {
    if (this.isVerified()) {
      throw new EmailAlreadyVerifiedException();
    }

    if (this.isExpired()) {
      throw new OtpExpiredException();
    }

    if (this._attempts >= EmailVerification.MAX_VERIFICATION_ATTEMPTS) {
      throw new OtpMaxAttemptsException();
    }

    this._attempts += 1;

    if (!this._otpCode.verify(submittedCode)) {
      if (this._attempts >= EmailVerification.MAX_VERIFICATION_ATTEMPTS) {
        throw new OtpMaxAttemptsException();
      }
      throw new Error('Invalid verification code.');
    }

    this._verifiedAt = new Date();
  }

  /**
   * Checks whether a new verification email can be sent (cooldown enforcement).
   */
  canResend(): boolean {
    const elapsed = (Date.now() - this.createdAt.getTime()) / 1000;
    return elapsed >= EmailVerification.RESEND_COOLDOWN_SECONDS;
  }

  /**
   * Guard: throws if the resend cooldown has not elapsed yet.
   */
  ensureCanResend(): void {
    if (!this.canResend()) {
      throw new OtpResendCooldownException();
    }
  }
}
