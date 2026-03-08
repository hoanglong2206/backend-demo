/**
 * ORM representation of the `refresh_token` table
 * (Prisma `RefreshToken` model).
 *
 * Mirrors the database row exactly. Note: the domain entity has
 * `revokedAt` and `replacedByToken` fields that are NOT in the
 * current Prisma schema — a migration is needed to add those columns.
 */
export interface RefreshTokenOrm {
  id: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  ipAddress: string | null;
  userId: string;
}
