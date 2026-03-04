import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  slowQueryThreshold: parseInt(
    process.env.SLOW_QUERY_THRESHOLD_MS || '1000',
    10,
  ), // in milliseconds
}));

export type DatabaseConfig = ReturnType<typeof databaseConfig>;
