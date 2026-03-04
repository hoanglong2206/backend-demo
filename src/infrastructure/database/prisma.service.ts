import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from '../../generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly configService: ConfigService) {
    const connectionString = configService.get<string>('database.url');
    const adapter = new PrismaPg({ connectionString });
    super({
      adapter,
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'event' },
      ],
    });

    (this as any).$on('query', (e: Prisma.QueryEvent) => {
      const slowQueryThreshold = configService.get<number>(
        'database.slowQueryThreshold',
        1000,
      );
      if (e.duration > slowQueryThreshold) {
        this.logger.warn({
          message: 'Slow query detected',
          query: e.query,
          params: e.params,
          durationMs: e.duration,
        });
      }
    });

    (this as any).$on('error', (e: Prisma.LogEvent) => {
      this.logger.error({
        message: 'Database error',
        target: e.target,
        detail: e.message,
      });
    });
  }

  async onModuleInit(): Promise<void> {
    this.logger.log('Connecting to database...');
    await this.$connect();
    this.logger.log('Database connected');
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Disconnecting from database...');
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }

  async executeTransaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>,
    options?: {
      maxRetries?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    },
  ): Promise<T> {
    const maxRetries = options?.maxRetries ?? 3;
    let attemp = 0;
    const timeout = options?.timeout ?? 5000;
    const isolationLevel =
      options?.isolationLevel ?? Prisma.TransactionIsolationLevel.ReadCommitted;

    while (attemp < maxRetries) {
      try {
        return await this.$transaction(callback, {
          maxWait: 5000,
          timeout,
          isolationLevel,
        });
      } catch (error) {
        attemp++;

        const isRetryable =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          ['P2034', 'P2028'].includes(error.code);

        if (!isRetryable || attemp === maxRetries) {
          throw error;
        }

        const delay = 50 * Math.pow(2, attemp - 1);
        this.logger.warn(
          `Transaction retry ${attemp}/${maxRetries} after ${delay}ms`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw new Error('Max retries exceeded');
  }

  withQueryLogging(): PrismaClient {
    return this.$extends({
      query: {
        $allOperations: async ({ model, operation, args, query }) => {
          const start = performance.now();
          const result = await query(args);
          const duration = Math.round(performance.now() - start);

          this.logger.debug({
            message: 'Query executed',
            model,
            operation,
            args,
            durationMs: duration,
          });

          return result;
        },
      },
    }) as PrismaClient;
  }
}
