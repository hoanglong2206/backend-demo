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
 * Guard that protects routes requiring a valid access token.
 *
 * Extracts the Bearer token from the Authorization header,
 * verifies it via ITokenGeneratorService, and attaches the
 * decoded payload to `request.user`.
 *
 * Usage:
 *   @UseGuards(JwtAuthGuard)
 *   @Get('profile')
 *   getProfile(@Req() req) { return req.user; }
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject('ITokenGeneratorService')
    private readonly tokenGenerator: ITokenGeneratorService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Missing access token.');
    }

    try {
      const payload = await this.tokenGenerator.verifyAccessToken(token);
      // Attach the decoded payload so controllers/handlers can read it
      (request as any).user = payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token.');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authorization = request.headers.authorization;
    if (!authorization) return undefined;

    const [type, token] = authorization.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
