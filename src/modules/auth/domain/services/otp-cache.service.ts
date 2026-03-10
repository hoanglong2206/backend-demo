/** How long an OTP is valid (10 minutes). */
export const OTP_TTL_SECONDS = 10 * 60;

/** Maximum number of failed OTP submission attempts before the code is locked. */
export const OTP_MAX_ATTEMPTS = 5;

/** Minimum seconds the user must wait before requesting a new OTP. */
export const OTP_RESEND_COOLDOWN_SECONDS = 60;

/**
 * Shape of an OTP verification record stored in the cache.
 */
export interface OtpEntry {
  /** Unique verification ID — also the JWT `sub` in the verification_token. */
  id: string;
  email: string;
  /** Placeholder userId for the not-yet-created account (equals `id` during registration). */
  userId: string;
  /** 6-digit numeric OTP. */
  otp: string;
  expiresAt: Date;
  createdAt: Date;
  /** Number of failed OTP attempts. */
  attempts: number;
  /** Set once the OTP has been accepted; gates the create-account step. */
  verifiedAt?: Date;
}

/**
 * Domain service interface for short-lived OTP storage.
 *
 * WHY: OTP codes are ephemeral, high-volume, and require fast TTL-based
 * expiry — a perfect fit for an in-memory cache (Redis) rather than a
 * relational database. Placing the interface in the domain layer keeps
 * use-case handlers independent of any specific cache technology.
 */
export interface IOtpCacheService {
  save(entry: OtpEntry): Promise<void>;
  findById(id: string): Promise<OtpEntry | null>;
  findLatestByEmail(email: string): Promise<OtpEntry | null>;
  /** Persist an updated entry, preserving the key's remaining TTL. */
  update(entry: OtpEntry): Promise<void>;
  delete(id: string): Promise<void>;
}
