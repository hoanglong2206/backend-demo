import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { IUserCredentialRepository } from '@modules/auth/domain/repositories/user-credential.repository';
import { IEmailVerificationRepository } from '@modules/auth/domain/repositories/email-verification.repository';
import { Email } from '@modules/auth/domain/value-objects/email.vo';
import { EmailVerification } from '@modules/auth/domain/entities/email-verification.entity';
import { ITokenGeneratorService } from '@modules/auth/domain/services/token-generator.service';
import { RegisterEmailInput, RegisterEmailOutput } from './register-email.dto';
import * as crypto from 'crypto';

/**
 * Use-case: Send an OTP to the user's email to begin the registration flow.
 *
 * If the email is not yet registered, creates an EmailVerification with
 * a fresh OTP and returns a verification_token that the client must
 * include when verifying the OTP.
 */
@Injectable()
export class RegisterEmailHandler {
  constructor(
    @Inject('IUserCredentialRepository')
    private readonly userCredentialRepo: IUserCredentialRepository,

    @Inject('IEmailVerificationRepository')
    private readonly emailVerificationRepo: IEmailVerificationRepository,

    @Inject('ITokenGeneratorService')
    private readonly tokenGenerator: ITokenGeneratorService,
  ) {}

  async execute(input: RegisterEmailInput): Promise<RegisterEmailOutput> {
    // 1. Validate and create the Email value object
    const emailResult = Email.create(input.email);
    if (emailResult.isFailure()) {
      throw new ConflictException(emailResult.getError());
    }
    const email = emailResult.getValue();

    // 2. Check for duplicate email
    const exists = await this.userCredentialRepo.existsByEmail(email);
    if (exists) {
      throw new ConflictException('An account with this email already exists.');
    }

    // 3. Create an EmailVerification with a fresh OTP
    //    At this stage, no UserCredential is created yet — it happens in create-account
    const verificationId = crypto.randomUUID();
    const emailVerification = EmailVerification.create(
      verificationId,
      email.value,
      verificationId, // userId placeholder — actual user created after verification
    );

    await this.emailVerificationRepo.save(emailVerification);

    // 4. Generate a verification_token the client must send back with the OTP
    const verificationToken = await this.tokenGenerator.generateAccessToken(
      verificationId,
      { email: email.value, purpose: 'email_verification' },
    );

    const output = new RegisterEmailOutput();
    output.verification_token = verificationToken;
    output.expires_at = emailVerification.expiresAt.getTime();
    return output;
  }
}
