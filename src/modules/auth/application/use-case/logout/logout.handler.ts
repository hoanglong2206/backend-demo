import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IRefreshTokenRepository } from '@modules/auth/domain/repositories/refresh-token.repository';
import { LogoutInput, LogoutOutput } from './logout.dto';

/**
 * Use-case: Log out the current session.
 *
 * Revokes the supplied refresh token so it can no longer
 * be used to obtain new access tokens.
 */
@Injectable()
export class LogoutHandler {
  constructor(
    @Inject('IRefreshTokenRepository')
    private readonly refreshTokenRepo: IRefreshTokenRepository,
  ) {}

  async execute(input: LogoutInput): Promise<LogoutOutput> {
    // 1. Find the refresh token
    const refreshToken = await this.refreshTokenRepo.findByToken(
      input.refresh_token,
    );
    if (!refreshToken) {
      throw new NotFoundException('Refresh token not found.');
    }

    // 2. Revoke it (domain handles already-revoked gracefully)
    refreshToken.revoke();
    await this.refreshTokenRepo.update(refreshToken);

    const output = new LogoutOutput();
    output.message = 'Logged out successfully.';
    return output;
  }
}
