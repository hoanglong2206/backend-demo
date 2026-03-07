import { AggregateRoot } from '@shared/common/kernel/aggregate-root';
import { Email } from '../value-objects/email.vo';
import { PasswordHash } from '../value-objects/password-hash.vo';
import { AccountLockedException } from '../exceptions/account-locked.exception';
import { InvalidCredentialsException } from '../exceptions/invalid-credentials.exception';

interface UserCredentialProps {
  email: Email;
  emailVerified: boolean;
  passwordHash: PasswordHash | null;
  isActive: boolean;
  lastLoginAt: Date | null;
  failedLoginCount: number;
  lockedUntil: Date | null;
  authProviders: string;
  providerId: string | null;
}

/**
 * Aggregate root representing a user's authentication credentials.
 *
 * WHY: Encapsulates all authentication-related state and enforces
 * business rules around login attempts, account locking, and
 * credential verification.
 */
export class UserCredential extends AggregateRoot {
  private _email: Email;
  private _emailVerified: boolean;
  private _passwordHash: PasswordHash | null;
  private _isActive: boolean;
  private _lastLoginAt: Date | null;
  private _failedLoginCount: number;
  private _lockedUntil: Date | null;
  private _authProviders: string;
  private _providerId: string | null;

  private static readonly MAX_FAILED_ATTEMPTS = 5;
  private static readonly LOCK_DURATION_MINUTES = 15;

  private constructor(
    id: string,
    props: UserCredentialProps,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt, updatedAt);
    this._email = props.email;
    this._emailVerified = props.emailVerified;
    this._passwordHash = props.passwordHash;
    this._isActive = props.isActive;
    this._lastLoginAt = props.lastLoginAt;
    this._failedLoginCount = props.failedLoginCount;
    this._lockedUntil = props.lockedUntil;
    this._authProviders = props.authProviders;
    this._providerId = props.providerId;
  }

  /**
   * Factory: create a brand-new local user credential.
   */
  static createLocal(
    id: string,
    email: Email,
    passwordHash: PasswordHash,
  ): UserCredential {
    return new UserCredential(id, {
      email,
      emailVerified: false,
      passwordHash,
      isActive: true,
      lastLoginAt: null,
      failedLoginCount: 0,
      lockedUntil: null,
      authProviders: 'local',
      providerId: null,
    });
  }

  /**
   * Factory: reconstitute from persistence.
   */
  static reconstitute(
    id: string,
    props: UserCredentialProps,
    createdAt: Date,
    updatedAt: Date,
  ): UserCredential {
    return new UserCredential(id, props, createdAt, updatedAt);
  }

  // ── Getters ───────────────────────────────────────────────

  get email(): Email {
    return this._email;
  }

  get emailVerified(): boolean {
    return this._emailVerified;
  }

  get passwordHash(): PasswordHash | null {
    return this._passwordHash;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get lastLoginAt(): Date | null {
    return this._lastLoginAt;
  }

  get failedLoginCount(): number {
    return this._failedLoginCount;
  }

  get lockedUntil(): Date | null {
    return this._lockedUntil;
  }

  get authProviders(): string {
    return this._authProviders;
  }

  get providerId(): string | null {
    return this._providerId;
  }

  // ── Domain behaviour ──────────────────────────────────────

  /**
   * Checks if the account is currently locked.
   */
  isLocked(): boolean {
    if (!this._lockedUntil) return false;
    if (new Date() > this._lockedUntil) {
      // Lock has expired – reset state
      this._lockedUntil = null;
      this._failedLoginCount = 0;
      this.touch();
      return false;
    }
    return true;
  }

  /**
   * Validate a plain-text password against the stored hash.
   * Enforces account locking after too many failed attempts.
   */
  async verifyPassword(plainPassword: string): Promise<void> {
    if (this.isLocked()) {
      throw new AccountLockedException();
    }

    if (!this._passwordHash) {
      throw new InvalidCredentialsException();
    }

    const isValid = await this._passwordHash.compare(plainPassword);

    if (!isValid) {
      this.registerFailedAttempt();
      throw new InvalidCredentialsException();
    }

    this.registerSuccessfulLogin();
  }

  /**
   * Marks the email as verified.
   */
  markEmailVerified(): void {
    this._emailVerified = true;
    this.touch();
  }

  /**
   * Deactivates the account.
   */
  deactivate(): void {
    this._isActive = false;
    this.touch();
  }

  /**
   * Reactivates the account.
   */
  activate(): void {
    this._isActive = true;
    this.touch();
  }

  /**
   * Locks the account by revoking all sessions.
   * Used when a security threat like token reuse is detected.
   */
  lockAccount(): void {
    this._lockedUntil = new Date(
      Date.now() + UserCredential.LOCK_DURATION_MINUTES * 60 * 1000,
    );
    this.touch();
  }

  // ── Private helpers ───────────────────────────────────────

  private registerFailedAttempt(): void {
    this._failedLoginCount += 1;

    if (this._failedLoginCount >= UserCredential.MAX_FAILED_ATTEMPTS) {
      this._lockedUntil = new Date(
        Date.now() + UserCredential.LOCK_DURATION_MINUTES * 60 * 1000,
      );
    }

    this.touch();
  }

  private registerSuccessfulLogin(): void {
    this._failedLoginCount = 0;
    this._lockedUntil = null;
    this._lastLoginAt = new Date();
    this.touch();
  }
}
