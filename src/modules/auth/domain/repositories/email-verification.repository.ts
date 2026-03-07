import { EmailVerification } from '../entities/email-verification.entity';

/**
 * Repository interface for EmailVerification entities.
 *
 * WHY: Defines the persistence contract in the domain layer so the
 * domain remains decoupled from any specific database or ORM.
 * Infrastructure adapters implement this interface.
 */
export interface IEmailVerificationRepository {
  /**
   * Persist a new email verification request.
   */
  save(emailVerification: EmailVerification): Promise<void>;

  /**
   * Find a verification by its unique ID.
   */
  findById(id: string): Promise<EmailVerification | null>;

  /**
   * Find the most recent pending (unverified, non-expired) verification
   * for a given user.
   */
  findLatestByUserId(userId: string): Promise<EmailVerification | null>;

  /**
   * Find a verification by the user's email address (latest first).
   */
  findLatestByEmail(email: string): Promise<EmailVerification | null>;

  /**
   * Update an existing email verification (e.g. after verifying or
   * incrementing attempts).
   */
  update(emailVerification: EmailVerification): Promise<void>;

  /**
   * Delete all verification records for a given user.
   * Useful after successful verification or account deletion.
   */
  deleteAllByUserId(userId: string): Promise<void>;
}
