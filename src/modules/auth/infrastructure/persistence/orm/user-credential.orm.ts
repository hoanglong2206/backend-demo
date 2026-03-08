/**
 * ORM representation of the `user_auth` table (Prisma `Auth` model).
 *
 * This is a plain data interface that mirrors the database row exactly.
 * It serves as the persistence-layer DTO — no domain logic belongs here.
 */
export interface UserCredentialOrm {
  id: string;
  email: string;
  emailVerified: boolean;
  passwordHash: string | null;
  isActive: boolean;
  lastLoginAt: Date | null;
  failedLoginCount: number;
  lockedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
  authProviders: string;
  providerId: string | null;
}
