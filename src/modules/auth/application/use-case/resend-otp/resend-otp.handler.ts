import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IEmailVerificationRepository } from '@modules/auth/domain/repositories/email-verification.repository';
import { ITokenGeneratorService } from '@modules/auth/domain/services/token-generator.service';
import { EmailVerification } from '@modules/auth/domain/entities/email-verification.entity';
import { ResendOtpInput, ResendOtpOutput } from './resend-otp.dto';
import * as crypto from 'crypto';

/**
 * Use-case: Resend a new OTP verification code.
 *
 * Checks the cooldown period on the previous verification,
 * then creates a fresh EmailVerification with a new OTP and
 * returns an updated verification_token.
 */
@Injectable()
export class ResendOtpHandler {
  constructor(
    @Inject('IEmailVerificationRepository')
    private readonly emailVerificationRepo: IEmailVerificationRepository,

    @Inject('ITokenGeneratorService')
    private readonly tokenGenerator: ITokenGeneratorService,
  ) {}

  async execute(input: ResendOtpInput): Promise<ResendOtpOutput> {
    // 1. Find the latest verification for this email
    const latestVerification =
      await this.emailVerificationRepo.findLatestByEmail(input.email);
    if (!latestVerification) {
      throw new NotFoundException(
        'No verification request found for this email.',
      );
    }

    // 2. Enforce cooldown (throws OtpResendCooldownException)
    latestVerification.ensureCanResend();

    // 3. Create a new EmailVerification with a fresh OTP
    const verificationId = crypto.randomUUID();
    const newVerification = EmailVerification.create(
      verificationId,
      input.email,
      latestVerification.userId,
    );

    await this.emailVerificationRepo.save(newVerification);

    // 4. Generate a new verification_token
    const verificationToken = await this.tokenGenerator.generateAccessToken(
      verificationId,
      { email: input.email, purpose: 'email_verification' },
    );

    const output = new ResendOtpOutput();
    output.verification_token = verificationToken;
    output.expires_at = newVerification.expiresAt.getTime();
    return output;
  }
}
