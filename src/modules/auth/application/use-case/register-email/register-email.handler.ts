import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { IUserCredentialRepository } from '@modules/auth/domain/repositories/user-credential.repository';
import { ITokenGeneratorService } from '@modules/auth/domain/services/token-generator.service';
import {
  IOtpCacheService,
  OtpEntry,
  OTP_TTL_SECONDS,
} from '@modules/auth/domain/services/otp-cache.service';
import { Email } from '@modules/auth/domain/value-objects/email.vo';
import { NodemailerEmailSenderService } from '@modules/auth/infrastructure/email/nodemailer-email-sender.service';
import { RegisterEmailInput, RegisterEmailOutput } from './register-email.dto';
import * as crypto from 'crypto';

/**
 * Use-case: Send an OTP to the user's email to begin the registration flow.
 *
 * Checks the email is not already registered, generates a cryptographically
 * random 6-digit OTP, stores it in Redis with a short TTL, and emails it
 * to the user. Returns a verification_token the client must include when
 * submitting the OTP.
 */
@Injectable()
export class RegisterEmailHandler {
  constructor(
    @Inject('IUserCredentialRepository')
    private readonly userCredentialRepo: IUserCredentialRepository,

    @Inject('ITokenGeneratorService')
    private readonly tokenGenerator: ITokenGeneratorService,

    @Inject('IOtpCacheService')
    private readonly otpCache: IOtpCacheService,

    private readonly emailSender: NodemailerEmailSenderService,
  ) {}

  async execute(input: RegisterEmailInput): Promise<RegisterEmailOutput> {
    // 1. Validate email format
    const emailResult = Email.create(input.email);
    if (emailResult.isFailure()) {
      throw new ConflictException(emailResult.getError());
    }
    const email = emailResult.getValue();

    // 2. Reject duplicate accounts
    const exists = await this.userCredentialRepo.existsByEmail(email);
    if (exists) {
      throw new ConflictException('An account with this email already exists.');
    }

    // 3. Generate a cryptographically secure 6-digit OTP
    const otp = crypto.randomInt(100_000, 1_000_000).toString();
    const verificationId = crypto.randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + OTP_TTL_SECONDS * 1000);

    const entry: OtpEntry = {
      id: verificationId,
      email: email.value,
      userId: verificationId, // placeholder — real userId created in create-account
      otp,
      expiresAt,
      createdAt: now,
      attempts: 0,
    };

    // 4. Persist OTP in Redis
    await this.otpCache.save(entry);

    // 5. Send OTP via email
    await this.emailSender.sendEmail({
      to: email.value,
      subject: 'Your verification code',
      text: `Your verification code is: ${otp}. It expires in 10 minutes.`,
      html: `<p>Your verification code is: <strong>${otp}</strong>.</p><p>It expires in 10 minutes.</p>`,
    });

    // 6. Issue a short-lived verification_token that binds the OTP submission to this flow
    const verificationToken = await this.tokenGenerator.generateAccessToken(
      verificationId,
      { email: email.value, purpose: 'email_verification' },
    );

    const output = new RegisterEmailOutput();
    output.verification_token = verificationToken;
    output.expires_at = expiresAt.getTime();
    return output;
  }
}
