import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { IRefreshTokenRepository } from '@modules/auth/domain/repositories/refresh-token.repository';
import { ITokenGeneratorService } from '@modules/auth/domain/services/token-generator.service';
import { IUserCredentialRepository } from '@modules/auth/domain/repositories/user-credential.repository';
import { RefreshToken } from '@modules/auth/domain/entities/refresh-token.entity';
import { TokenReuseDetectedException } from '@modules/auth/domain/exceptions/token-reuse-detected.exception';
import { RefreshTokenInput, RefreshTokenOutput } from './refresh-token.dto';
import * as crypto from 'crypto';

/**
 * Use-case: Rotate refresh tokens (refresh-token rotation pattern).
 *
 * Validates the existing token, rotates it (revoke old → issue new),
 * and detects token reuse (which triggers a full session revocation
 * plus account lock for security).
 */
@Injectable()
export class RefreshTokenHandler {
  constructor(
    @Inject('IRefreshTokenRepository')
    private readonly refreshTokenRepo: IRefreshTokenRepository,

    @Inject('ITokenGeneratorService')
    private readonly tokenGenerator: ITokenGeneratorService,

    @Inject('IUserCredentialRepository')
    private readonly userCredentialRepo: IUserCredentialRepository,
  ) {}

  async execute(input: RefreshTokenInput): Promise<RefreshTokenOutput> {
    // 1. Find the existing refresh token
    const existingToken = await this.refreshTokenRepo.findByToken(
      input.refresh_token,
    );
    if (!existingToken) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    // 2. Check if the token is expired
    if (existingToken.isExpired()) {
      throw new UnauthorizedException('Refresh token has expired.');
    }

    // 3. Generate the new token strings
    const newAccessToken = await this.tokenGenerator.generateAccessToken(
      existingToken.userId,
    );
    const newRefreshTokenString =
      await this.tokenGenerator.generateRefreshToken(existingToken.userId);

    // 4. Rotate the existing token
    //    This throws TokenReuseDetectedException if the token was already revoked
    try {
      existingToken.rotate(newRefreshTokenString);
    } catch (error) {
      if (error instanceof TokenReuseDetectedException) {
        // Security event: revoke ALL tokens for this user and lock account
        await this.refreshTokenRepo.revokeAllByUserId(existingToken.userId);

        const user = await this.userCredentialRepo.findById(
          existingToken.userId,
        );
        if (user) {
          user.lockAccount();
          await this.userCredentialRepo.update(user);
        }

        throw error;
      }
      throw error;
    }

    // 5. Persist the rotated old token
    await this.refreshTokenRepo.update(existingToken);

    // 6. Create and persist the new refresh token entity
    const refreshTokenExpiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    );
    const newRefreshToken = RefreshToken.create(
      crypto.randomUUID(),
      newRefreshTokenString,
      refreshTokenExpiresAt,
      existingToken.userId,
    );
    await this.refreshTokenRepo.save(newRefreshToken);

    // 7. Build response
    const output = new RefreshTokenOutput();
    output.access_token = newAccessToken;
    output.refresh_token = newRefreshTokenString;
    output.expires_at = refreshTokenExpiresAt.getTime();
    return output;
  }
}
