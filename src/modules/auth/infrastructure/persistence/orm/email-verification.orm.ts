/**
 * ORM representation of the `email_verification` table
 * (Prisma `EmailVerification` model).
 *
 * Mirrors the database row exactly. The Prisma schema uses `token`
 * to store the OTP code value.
 */
export interface EmailVerificationOrm {
  id: string;
  email: string;
  token: string; // OTP code value stored in the `token` column
  expiresAt: Date;
  verifiedAt: Date | null;
  createdAt: Date;
  ipAddress: string | null;
  userId: string;
}
