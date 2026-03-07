import { RefreshToken } from '../entities/refresh-token.entity';

/**
 * Repository interface for RefreshToken entities.
 *
 * WHY: Abstracts persistence for refresh tokens so the domain can
 * enforce token rotation and reuse-detection rules without coupling
 * to a specific storage mechanism.
 */
export interface IRefreshTokenRepository {
  /**
   * Persist a new refresh token.
   */
  save(refreshToken: RefreshToken): Promise<void>;

  /**
   * Find a refresh token by its unique ID.
   */
  findById(id: string): Promise<RefreshToken | null>;

  /**
   * Find a refresh token by its raw token string.
   */
  findByToken(token: string): Promise<RefreshToken | null>;

  /**
   * Find all active (non-revoked, non-expired) tokens for a user.
   */
  findActiveByUserId(userId: string): Promise<RefreshToken[]>;

  /**
   * Update an existing refresh token (e.g. after rotation or revocation).
   */
  update(refreshToken: RefreshToken): Promise<void>;

  /**
   * Revoke all refresh tokens for a given user.
   * Used during security events like token reuse detection or password change.
   */
  revokeAllByUserId(userId: string): Promise<void>;

  /**
   * Delete expired and revoked tokens older than the specified date.
   * Housekeeping operation to prevent unbounded table growth.
   */
  deleteExpiredBefore(date: Date): Promise<void>;
}
