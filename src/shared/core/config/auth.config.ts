import { registerAs } from '@nestjs/config';

export const authConfig = registerAs('auth', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET || 'change-me-access-secret',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'change-me-refresh-secret',
  accessExpiresIn: parseInt(process.env.JWT_ACCESS_EXPIRES_IN || '900', 10), // 15 minutes
  refreshExpiresIn: parseInt(
    process.env.JWT_REFRESH_EXPIRES_IN || '604800',
    10,
  ), // 7 days
}));

export type AuthConfig = ReturnType<typeof authConfig>;
