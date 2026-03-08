import {
  Injectable,
  Inject,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { IUserCredentialRepository } from '@modules/auth/domain/repositories/user-credential.repository';
import { IRefreshTokenRepository } from '@modules/auth/domain/repositories/refresh-token.repository';
import { IPasswordHasherService } from '@modules/auth/domain/services/password-hasher.service';
import { ITokenGeneratorService } from '@modules/auth/domain/services/token-generator.service';
import { UserCredential } from '@modules/auth/domain/entities/user-credential.entity';
import { RefreshToken } from '@modules/auth/domain/entities/refresh-token.entity';
import { Email } from '@modules/auth/domain/value-objects/email.vo';
import {
  CreateAccountInput,
  CreateAccountOutput,
  UserOutput,
  SessionOutput,
} from './create-account.dto';
import * as crypto from 'crypto';

/**
 * Use-case: Finalize account creation after email OTP verification.
 *
 * Validates the account_token (issued after successful OTP verification),
 * creates the UserCredential with the real password, and issues a
 * session (access + refresh tokens) so the user is immediately logged in.
 */
@Injectable()
export class CreateAccountHandler {
  constructor(
    @Inject('IUserCredentialRepository')
    private readonly userCredentialRepo: IUserCredentialRepository,

    @Inject('IRefreshTokenRepository')
    private readonly refreshTokenRepo: IRefreshTokenRepository,

    @Inject('IPasswordHasherService')
    private readonly passwordHasher: IPasswordHasherService,

    @Inject('ITokenGeneratorService')
    private readonly tokenGenerator: ITokenGeneratorService,
  ) {}

  async execute(input: CreateAccountInput): Promise<CreateAccountOutput> {
    // 1. Verify the account_token
    let payload: Record<string, unknown>;
    try {
      payload = await this.tokenGenerator.verifyAccessToken(
        input.account_token,
      );
    } catch {
      throw new UnauthorizedException('Invalid or expired account token.');
    }

    if (payload.purpose !== 'account_creation' || payload.verified !== true) {
      throw new UnauthorizedException('Invalid account token.');
    }

    // 2. Validate and create the Email value object
    const emailResult = Email.create(input.email);
    if (emailResult.isFailure()) {
      throw new ConflictException(emailResult.getError());
    }
    const email = emailResult.getValue();

    // 3. Check for duplicate email
    const exists = await this.userCredentialRepo.existsByEmail(email);
    if (exists) {
      throw new ConflictException('An account with this email already exists.');
    }

    // 4. Hash the password
    const passwordHash = await this.passwordHasher.hash(input.password);

    // 5. Create the UserCredential
    const userId = crypto.randomUUID();
    const userCredential = UserCredential.createLocal(
      userId,
      email,
      passwordHash,
    );
    userCredential.markEmailVerified(); // email was verified via OTP

    await this.userCredentialRepo.save(userCredential);

    // 6. Generate session tokens
    const accessToken = await this.tokenGenerator.generateAccessToken(userId, {
      email: email.value,
    });
    const refreshTokenString =
      await this.tokenGenerator.generateRefreshToken(userId);

    const refreshTokenExpiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    );

    const refreshTokenEntity = RefreshToken.create(
      crypto.randomUUID(),
      refreshTokenString,
      refreshTokenExpiresAt,
      userId,
    );
    await this.refreshTokenRepo.save(refreshTokenEntity);

    // 7. Build response
    const user = new UserOutput();
    user.id = userCredential.id;
    user.email = userCredential.email.value;
    user.is_verified = userCredential.emailVerified;
    user.is_active = userCredential.isActive;
    user.created_at = userCredential.createdAt.toISOString();
    user.updated_at = userCredential.updatedAt.toISOString();

    const session = new SessionOutput();
    session.access_token = accessToken;
    session.refresh_token = refreshTokenString;
    session.expires_at = refreshTokenExpiresAt.getTime();

    const output = new CreateAccountOutput();
    output.user = user;
    output.session = session;
    return output;
  }
}
