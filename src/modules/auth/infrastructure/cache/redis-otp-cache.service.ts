import { Injectable } from '@nestjs/common';
import { RedisService } from '@infrastructure/redis/redis.service';
import type {
  IOtpCacheService,
  OtpEntry,
} from '@modules/auth/domain/services/otp-cache.service';
import {
  OTP_TTL_SECONDS,
  OTP_RESEND_COOLDOWN_SECONDS,
} from '@modules/auth/domain/services/otp-cache.service';

/** Wire-format of an OtpEntry stored in Redis (Date fields serialised as ISO strings). */
type RawOtpEntry = Omit<OtpEntry, 'expiresAt' | 'createdAt' | 'verifiedAt'> & {
  expiresAt: string;
  createdAt: string;
  verifiedAt?: string | null;
};

/**
 * Redis implementation of IOtpCacheService.
 *
 * Key schema:
 *   otp:id:{verificationId}    → JSON-serialised OtpEntry   (TTL = OTP_TTL_SECONDS)
 *   otp:email:{email}          → verificationId string       (TTL = OTP_TTL_SECONDS + cooldown)
 *
 * The email → id pointer lives slightly longer than the OTP itself so that
 * the resend-cooldown check can still block rapid re-requests made just
 * before the original OTP expires.
 */
@Injectable()
export class RedisOtpCacheService implements IOtpCacheService {
  private readonly idKey = (id: string): string => `otp:id:${id}`;
  private readonly emailKey = (email: string): string =>
    `otp:email:${email.toLowerCase()}`;

  constructor(private readonly redis: RedisService) {}

  async save(entry: OtpEntry): Promise<void> {
    const emailPointerTtl = OTP_TTL_SECONDS + OTP_RESEND_COOLDOWN_SECONDS;
    const { id, email } = entry;
    const serialised = JSON.stringify(entry);
    await Promise.all([
      this.redis.set(this.idKey(id), serialised, OTP_TTL_SECONDS),
      this.redis.set(this.emailKey(email), id, emailPointerTtl),
    ]);
  }

  async findById(id: string): Promise<OtpEntry | null> {
    const raw = await this.redis.get(this.idKey(id));
    return raw ? this.deserialize(raw) : null;
  }

  async findLatestByEmail(email: string): Promise<OtpEntry | null> {
    const id = await this.redis.get(this.emailKey(email));
    if (!id) return null;
    return this.findById(id);
  }

  async update(entry: OtpEntry): Promise<void> {
    const key = this.idKey(entry.id);
    // Preserve the remaining TTL so an update never extends the OTP window.
    const remainingTtl = await this.redis.client.ttl(key);
    if (remainingTtl <= 0) return; // already expired — nothing to do
    await this.redis.client.set(key, JSON.stringify(entry), 'EX', remainingTtl);
  }

  async delete(id: string): Promise<void> {
    await this.redis.del(this.idKey(id));
  }

  private deserialize(raw: string): OtpEntry {
    const d = JSON.parse(raw) as RawOtpEntry;
    return {
      id: d.id,
      email: d.email,
      userId: d.userId,
      otp: d.otp,
      attempts: d.attempts,
      expiresAt: new Date(d.expiresAt),
      createdAt: new Date(d.createdAt),
      verifiedAt: d.verifiedAt ? new Date(d.verifiedAt) : undefined,
    };
  }
}
