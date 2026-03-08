import { Injectable, Inject } from '@nestjs/common';
import { IUserCredentialRepository } from '@modules/auth/domain/repositories/user-credential.repository';
import { IRefreshTokenRepository } from '@modules/auth/domain/repositories/refresh-token.repository';
import { ITokenGeneratorService } from '@modules/auth/domain/services/token-generator.service';
import { Email } from '@modules/auth/domain/value-objects/email.vo';
import { RefreshToken } from '@modules/auth/domain/entities/refresh-token.entity';
import { InvalidCredentialsException } from '@modules/auth/domain/exceptions/invalid-credentials.exception';
import { LoginInput, LoginOutput } from './login.dto';
import {
  UserOutput,
  SessionOutput,
} from '../create-account/create-account.dto';
import * as crypto from 'crypto';

/**
 * Use-case: Authenticate a user with email + password.
 *
 * Validates credentials via the UserCredential aggregate (which
 * enforces account locking after too many failed attempts),
 * then issues access and refresh tokens.
 */
@Injectable()
export class LoginHandler {
  constructor(
    @Inject('IUserCredentialRepository')
    private readonly userCredentialRepo: IUserCredentialRepository,

    @Inject('IRefreshTokenRepository')
    private readonly refreshTokenRepo: IRefreshTokenRepository,

    @Inject('ITokenGeneratorService')
    private readonly tokenGenerator: ITokenGeneratorService,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    // 1. Find the user by email
    const emailResult = Email.create(input.email);
    if (emailResult.isFailure()) {
      throw new InvalidCredentialsException();
    }
    const email = emailResult.getValue();

    const userCredential = await this.userCredentialRepo.findByEmail(email);
    if (!userCredential) {
      throw new InvalidCredentialsException();
    }

    // 2. Verify password (domain enforces locking, failed attempt tracking)
    await userCredential.verifyPassword(input.password);

    // 3. Persist updated credential (lastLoginAt, failedLoginCount reset)
    await this.userCredentialRepo.update(userCredential);

    // 4. Generate tokens
    const accessToken = await this.tokenGenerator.generateAccessToken(
      userCredential.id,
      { email: userCredential.email.value },
    );
    const refreshTokenString = await this.tokenGenerator.generateRefreshToken(
      userCredential.id,
    );

    // 5. Create and persist the refresh token entity
    const refreshTokenExpiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    );
    const refreshTokenEntity = RefreshToken.create(
      crypto.randomUUID(),
      refreshTokenString,
      refreshTokenExpiresAt,
      userCredential.id,
    );
    await this.refreshTokenRepo.save(refreshTokenEntity);

    // 6. Build response
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

    const output = new LoginOutput();
    output.user = user;
    output.session = session;
    return output;
  }
}
