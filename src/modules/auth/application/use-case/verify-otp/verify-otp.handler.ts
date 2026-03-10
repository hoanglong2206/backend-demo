import {
  Injectable,
  Inject,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ITokenGeneratorService } from '@modules/auth/domain/services/token-generator.service';
import {
  IOtpCacheService,
  OTP_MAX_ATTEMPTS,
} from '@modules/auth/domain/services/otp-cache.service';
import { OtpExpiredException } from '@modules/auth/domain/exceptions/otp-expired.exception';
import { OtpMaxAttemptsException } from '@modules/auth/domain/exceptions/otp-max-attempts.exception';
import { EmailAlreadyVerifiedException } from '@modules/auth/domain/exceptions/email-already-verified.exception';
import { VerifyOtpInput, VerifyOtpOutput } from './verify-otp.dto';

/**
 * Use-case: Verify the OTP code sent to the user's email.
 *
 * Extracts the verificationId from the verification_token JWT, looks up
 * the OTP entry in Redis, and enforces expiry / max-attempts / already-
 * verified rules. On success marks the entry as verified and returns an
 * account_token for the final create-account step.
 */
@Injectable()
export class VerifyOtpHandler {
  constructor(
    @Inject('ITokenGeneratorService')
    private readonly tokenGenerator: ITokenGeneratorService,

    @Inject('IOtpCacheService')
    private readonly otpCache: IOtpCacheService,
  ) {}

  async execute(input: VerifyOtpInput): Promise<VerifyOtpOutput> {
    // 1. Decode the verification_token to get the verificationId
    let payload: Record<string, unknown>;
    try {
      payload = await this.tokenGenerator.verifyAccessToken(
        input.verification_token,
      );
    } catch {
      throw new UnauthorizedException('Invalid or expired verification token.');
    }

    const verificationId = payload.sub as string | undefined;
    if (!verificationId) {
      throw new UnauthorizedException('Invalid verification token payload.');
    }

    // 2. Load the OTP entry from Redis
    const entry = await this.otpCache.findById(verificationId);
    if (!entry) {
      throw new NotFoundException('No pending verification found.');
    }

    // 3. Guard: already verified
    if (entry.verifiedAt) {
      throw new EmailAlreadyVerifiedException();
    }

    // 4. Guard: OTP expired (Redis TTL expired → entry gone, but belt-and-suspenders check)
    if (new Date() > entry.expiresAt) {
      throw new OtpExpiredException();
    }

    // 5. Guard: max attempts reached
    if (entry.attempts >= OTP_MAX_ATTEMPTS) {
      throw new OtpMaxAttemptsException();
    }

    // 6. Validate the submitted code
    if (entry.otp !== input.otp) {
      entry.attempts += 1;
      await this.otpCache.update(entry);
      if (entry.attempts >= OTP_MAX_ATTEMPTS) {
        throw new OtpMaxAttemptsException();
      }
      throw new UnauthorizedException('Invalid OTP code.');
    }

    // 7. Mark as verified
    entry.verifiedAt = new Date();
    await this.otpCache.update(entry);

    // 8. Issue an account_token for the create-account step
    const accountToken = await this.tokenGenerator.generateAccessToken(
      verificationId,
      { email: entry.email, purpose: 'account_creation', verified: true },
    );

    const output = new VerifyOtpOutput();
    output.verified = true;
    output.account_token = accountToken;
    return output;
  }
}
