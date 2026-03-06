import { ValueObject } from '@shared/common/kernel/value-object';
import { Result } from '@shared/common/kernel/result';
import * as crypto from 'crypto';

interface OtpCodeProps {
  value: string;
  expiresAt: Date;
}

export class OtpCode extends ValueObject<OtpCodeProps> {
  private static readonly CODE_LENGTH = 6;
  private static readonly DEFAULT_TTL_MINUTES = 5;
  private static readonly OTP_REGEX = /^\d{6}$/;

  private constructor(props: OtpCodeProps) {
    super(props);
  }

  static generate(ttlMinutes?: number): OtpCode {
    const ttl = ttlMinutes ?? OtpCode.DEFAULT_TTL_MINUTES;
    const code = OtpCode.generateSecureCode();
    const expiresAt = new Date(Date.now() + ttl * 60 * 1000);

    return new OtpCode({ value: code, expiresAt });
  }

  static create(code: string, expiresAt: Date): Result<OtpCode, string> {
    if (!code || !OtpCode.OTP_REGEX.test(code)) {
      return Result.fail(
        `OTP code must be exactly ${OtpCode.CODE_LENGTH} digits.`,
      );
    }

    return Result.ok(new OtpCode({ value: code, expiresAt }));
  }

  get value(): string {
    return this.props.value;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  isExpired(): boolean {
    return new Date() > this.props.expiresAt;
  }

  verify(input: string): boolean {
    if (this.isExpired()) return false;
    return this.props.value === input;
  }

  private static generateSecureCode(): string {
    const buffer = crypto.randomBytes(4);
    const num = buffer.readUInt32BE(0) % 10 ** OtpCode.CODE_LENGTH;
    return num.toString().padStart(OtpCode.CODE_LENGTH, '0');
  }

  protected validateProps(props: OtpCodeProps): void {
    if (!props.value || !OtpCode.OTP_REGEX.test(props.value)) {
      throw new Error('Invalid code provided to OtpCode value object.');
    }
    if (!props.expiresAt || !(props.expiresAt instanceof Date)) {
      throw new Error('Invalid expiresAt provided to OtpCode value object.');
    }
  }
}
