import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ITokenGeneratorService } from '@modules/auth/domain/services/token-generator.service';

/**
 * JWT implementation of ITokenGeneratorService.
 *
 * Uses @nestjs/jwt under the hood. Access tokens are short-lived
 * JWTs; refresh tokens are longer-lived JWTs with a different secret.
 */
@Injectable()
export class JwtTokenGeneratorService implements ITokenGeneratorService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiresIn: number;
  private readonly refreshExpiresIn: number;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessSecret =
      this.configService.getOrThrow<string>('auth.accessSecret');
    this.refreshSecret =
      this.configService.getOrThrow<string>('auth.refreshSecret');
    this.accessExpiresIn = this.configService.get<number>(
      'auth.accessExpiresIn',
      900, // 15 minutes in seconds
    );
    this.refreshExpiresIn = this.configService.get<number>(
      'auth.refreshExpiresIn',
      604800, // 7 days in seconds
    );
  }

  async generateAccessToken(
    userId: string,
    payload?: Record<string, unknown>,
  ): Promise<string> {
    return this.jwtService.signAsync(
      { sub: userId, ...payload },
      {
        secret: this.accessSecret,
        expiresIn: this.accessExpiresIn,
      },
    );
  }

  async generateRefreshToken(userId: string): Promise<string> {
    return this.jwtService.signAsync(
      { sub: userId, type: 'refresh' },
      {
        secret: this.refreshSecret,
        expiresIn: this.refreshExpiresIn,
      },
    );
  }

  async verifyAccessToken(token: string): Promise<Record<string, unknown>> {
    return this.jwtService.verifyAsync(token, {
      secret: this.accessSecret,
    });
  }

  async verifyRefreshToken(token: string): Promise<string> {
    const payload = await this.jwtService.verifyAsync(token, {
      secret: this.refreshSecret,
    });
    return payload.sub;
  }
}
