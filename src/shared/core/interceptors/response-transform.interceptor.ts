import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Request } from 'express';

/**
 * Wraps all successful responses in a standard envelope.
 *
 * WHY: Mobile and frontend clients need a predictable response shape.
 * Without this, some endpoints return { data: [...] } and others return
 * raw arrays. Inconsistency causes bugs on every client that consumes your API.
 *
 * Before: { id: 1, name: "John" }
 * After:  { success: true, data: { id: 1, name: "John" }, timestamp: "..." }
 */
@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const requestId = request.headers['x-request-id'] as string;

    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
          path: request.url,
        },
      })),
    );
  }
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: {
    timestamp: string;
    requestId: string;
    path: string;
  };
}
