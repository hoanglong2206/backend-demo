import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';

/**
 * Logs every HTTP request and its outcome.
 *
 * WHY: Consistent request/response logging in a single place avoids
 * duplicating log statements across controllers. The interceptor also
 * captures the total request duration, which is useful for identifying
 * slow endpoints.
 *
 * Format → [HTTP] METHOD /path 200 42ms  (request-id: <id>)
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = ctx.switchToHttp().getRequest<Request>();
    const response = ctx.switchToHttp().getResponse<Response>();
    const { method, url } = request;
    const requestId = Array.isArray(request.headers['x-request-id'])
      ? request.headers['x-request-id'][0]
      : (request.headers['x-request-id'] ?? '-');
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - start;
          this.logger.log(
            `${method} ${url} ${response.statusCode} +${ms}ms  (request-id: ${requestId})`,
          );
        },
        error: (err: unknown) => {
          const ms = Date.now() - start;
          const status =
            typeof err === 'object' &&
            err !== null &&
            'getStatus' in err &&
            typeof (err as { getStatus: () => number }).getStatus === 'function'
              ? (err as { getStatus: () => number }).getStatus()
              : 500;
          this.logger.error(
            `${method} ${url} ${status} +${ms}ms  (request-id: ${requestId})`,
          );
        },
      }),
    );
  }
}
