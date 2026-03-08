import {
  Injectable,
  Inject,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { IEmailVerificationRepository } from '@modules/auth/domain/repositories/email-verification.repository';
import { ITokenGeneratorService } from '@modules/auth/domain/services/token-generator.service';
import { VerifyOtpInput, VerifyOtpOutput } from './verify-otp.dto';

/**
 * Use-case: Verify the OTP code sent to the user's email.
 *
 * Validates the verification_token, finds the matching
 * EmailVerification entity, and delegates OTP checking to
 * the domain (which enforces expiry, max-attempts, and
 * already-verified rules).
 *
 * On success, returns an account_token the client uses to
 * finalize registration in the create-account flow.
 */
@Injectable()
export class VerifyOtpHandler {
  constructor(
    @Inject('IEmailVerificationRepository')
    private readonly emailVerificationRepo: IEmailVerificationRepository,

    @Inject('ITokenGeneratorService')
    private readonly tokenGenerator: ITokenGeneratorService,
  ) {}

  async execute(input: VerifyOtpInput): Promise<VerifyOtpOutput> {
    // 1. Verify the verification_token to extract the verificationId
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

    // 2. Find the EmailVerification entity
    const verification =
      await this.emailVerificationRepo.findById(verificationId);
    if (!verification) {
      throw new NotFoundException('No pending verification found.');
    }

    // 3. Verify the OTP (domain enforces expiry, max attempts, already-verified)
    verification.verify(input.otp);

    // 4. Persist the updated verification (attempts, verifiedAt)
    await this.emailVerificationRepo.update(verification);

    // 5. Generate an account_token for the create-account step
    const accountToken = await this.tokenGenerator.generateAccessToken(
      verificationId,
      {
        email: verification.email,
        purpose: 'account_creation',
        verified: true,
      },
    );

    const output = new VerifyOtpOutput();
    output.verified = true;
    output.account_token = accountToken;
    return output;
  }
}
