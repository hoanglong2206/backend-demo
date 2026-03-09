import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ITokenGeneratorService } from '@modules/auth/domain/services/token-generator.service';

/**
 * Guard that protects routes requiring a valid refresh token.
 *
 * Extracts the refresh token from the request body (`refresh_token`),
 * verifies it via ITokenGeneratorService, and attaches the userId
 * to `request.user`.
 *
 * Usage:
 *   @UseGuards(RefreshTokenGuard)
 *   @Post('refresh-token')
 *   refresh(@Req() req, @Body() dto) { ... }
 */
@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    @Inject('ITokenGeneratorService')
    private readonly tokenGenerator: ITokenGeneratorService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const refreshToken = request.body?.refresh_token;

    if (!refreshToken || typeof refreshToken !== 'string') {
      throw new UnauthorizedException('Missing refresh token.');
    }

    try {
      const userId = await this.tokenGenerator.verifyRefreshToken(refreshToken);
      (request as any).user = { sub: userId };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    return true;
  }
}
