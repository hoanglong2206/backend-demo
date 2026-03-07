import { BaseEntity } from '@shared/common/kernel/base.entity';
import { TokenReuseDetectedException } from '../exceptions/token-reuse-detected.exception';

interface RefreshTokenProps {
  token: string;
  expiresAt: Date;
  ipAddress: string | null;
  userId: string;
  revokedAt: Date | null;
  replacedByToken: string | null;
}

/**
 * Entity representing a refresh token issued to a user.
 *
 * WHY: Refresh tokens carry their own lifecycle (issue → use → rotate / revoke)
 * and enforce the refresh-token rotation security pattern.
 * Reuse of a revoked token indicates potential theft and triggers
 * a full session revocation.
 */
export class RefreshToken extends BaseEntity {
  private _token: string;
  private _expiresAt: Date;
  private _ipAddress: string | null;
  private _userId: string;
  private _revokedAt: Date | null;
  private _replacedByToken: string | null;

  private constructor(id: string, props: RefreshTokenProps, createdAt?: Date) {
    super(id, createdAt);
    this._token = props.token;
    this._expiresAt = props.expiresAt;
    this._ipAddress = props.ipAddress;
    this._userId = props.userId;
    this._revokedAt = props.revokedAt;
    this._replacedByToken = props.replacedByToken;
  }

  /**
   * Factory: issue a new refresh token.
   */
  static create(
    id: string,
    token: string,
    expiresAt: Date,
    userId: string,
    ipAddress?: string | null,
  ): RefreshToken {
    return new RefreshToken(id, {
      token,
      expiresAt,
      ipAddress: ipAddress ?? null,
      userId,
      revokedAt: null,
      replacedByToken: null,
    });
  }

  /**
   * Factory: reconstitute from persistence.
   */
  static reconstitute(
    id: string,
    props: RefreshTokenProps,
    createdAt: Date,
  ): RefreshToken {
    return new RefreshToken(id, props, createdAt);
  }

  // ── Getters ───────────────────────────────────────────────

  get token(): string {
    return this._token;
  }

  get expiresAt(): Date {
    return this._expiresAt;
  }

  get ipAddress(): string | null {
    return this._ipAddress;
  }

  get userId(): string {
    return this._userId;
  }

  get revokedAt(): Date | null {
    return this._revokedAt;
  }

  get replacedByToken(): string | null {
    return this._replacedByToken;
  }

  // ── Domain behaviour ──────────────────────────────────────

  /**
   * Whether the token has expired.
   */
  isExpired(): boolean {
    return new Date() > this._expiresAt;
  }

  /**
   * Whether the token has been revoked (either directly or by rotation).
   */
  isRevoked(): boolean {
    return this._revokedAt !== null;
  }

  /**
   * Whether this token is still usable (not expired and not revoked).
   */
  isActive(): boolean {
    return !this.isRevoked() && !this.isExpired();
  }

  /**
   * Use this token by rotating it: revokes the current token and
   * records which token replaced it.
   *
   * @throws TokenReuseDetectedException if the token was already revoked.
   */
  rotate(replacementToken: string): void {
    if (this.isRevoked()) {
      throw new TokenReuseDetectedException();
    }

    this._revokedAt = new Date();
    this._replacedByToken = replacementToken;
  }

  /**
   * Explicitly revoke this token (e.g. on logout or security event).
   */
  revoke(): void {
    if (!this.isRevoked()) {
      this._revokedAt = new Date();
    }
  }
}
