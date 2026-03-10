import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ITokenGeneratorService } from '@modules/auth/domain/services/token-generator.service';
import {
  IOtpCacheService,
  OtpEntry,
  OTP_TTL_SECONDS,
  OTP_RESEND_COOLDOWN_SECONDS,
} from '@modules/auth/domain/services/otp-cache.service';
import { OtpResendCooldownException } from '@modules/auth/domain/exceptions/otp-resend-cooldown.exception';
import { NodemailerEmailSenderService } from '@modules/auth/infrastructure/email/nodemailer-email-sender.service';
import { ResendOtpInput, ResendOtpOutput } from './resend-otp.dto';
import * as crypto from 'crypto';

/**
 * Use-case: Resend a fresh OTP to the user's email.
 *
 * Looks up the most recent pending OTP for the supplied email, enforces
 * the resend cooldown, then generates a new OTP, persists it in Redis,
 * and emails it to the user.
 */
@Injectable()
export class ResendOtpHandler {
  constructor(
    @Inject('ITokenGeneratorService')
    private readonly tokenGenerator: ITokenGeneratorService,

    @Inject('IOtpCacheService')
    private readonly otpCache: IOtpCacheService,

    private readonly emailSender: NodemailerEmailSenderService,
  ) {}

  async execute(input: ResendOtpInput): Promise<ResendOtpOutput> {
    // 1. Ensure there is an existing pending verification for this email
    const latest = await this.otpCache.findLatestByEmail(input.email);
    if (!latest) {
      throw new NotFoundException(
        'No verification request found for this email.',
      );
    }

    // 2. Enforce cooldown — prevent OTP flooding
    const elapsedMs = Date.now() - latest.createdAt.getTime();
    if (elapsedMs < OTP_RESEND_COOLDOWN_SECONDS * 1000) {
      throw new OtpResendCooldownException();
    }

    // 3. Generate a fresh OTP
    const otp = crypto.randomInt(100_000, 1_000_000).toString();
    const verificationId = crypto.randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + OTP_TTL_SECONDS * 1000);

    const entry: OtpEntry = {
      id: verificationId,
      email: input.email,
      userId: latest.userId, // carry over the placeholder userId
      otp,
      expiresAt,
      createdAt: now,
      attempts: 0,
    };

    // 4. Persist new OTP in Redis (overwrites the email pointer)
    await this.otpCache.save(entry);

    // 5. Send new OTP via email
    await this.emailSender.sendEmail({
      to: input.email,
      subject: 'Your new verification code',
      text: `Your new verification code is: ${otp}. It expires in 10 minutes.`,
      html: `<p>Your new verification code is: <strong>${otp}</strong>.</p><p>It expires in 10 minutes.</p>`,
    });

    // 6. Issue a fresh verification_token for the new verificationId
    const verificationToken = await this.tokenGenerator.generateAccessToken(
      verificationId,
      { email: input.email, purpose: 'email_verification' },
    );

    const output = new ResendOtpOutput();
    output.verification_token = verificationToken;
    output.expires_at = expiresAt.getTime();
    return output;
  }
}
