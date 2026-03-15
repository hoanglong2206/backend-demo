import { AggregateRoot } from '@shared/common/kernel/aggregate-root';
import { Username } from '../value-objects/username.vo';
import { FullName } from '../value-objects/full-name.vo';
import { AvatarUrl } from '../value-objects/avatar-url.vo';
import { UserAlreadyDeletedException } from '../exceptions/user-already-deleted.exception';

interface UserProfileProps {
  username: Username;
  fullName: FullName;
  avatarUrl: AvatarUrl;
}

/**
 * Aggregate root representing a user's profile.
 *
 * WHY: Encapsulates all user profile data and enforces business rules
 * around profile updates, username uniqueness, and deletion.
 */
export class UserProfile extends AggregateRoot {
  private _username: Username;
  private _fullName: FullName;
  private _avatarUrl: AvatarUrl;

  private static readonly MAX_BIO_LENGTH = 500;

  private constructor(
    id: string,
    props: UserProfileProps,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt, updatedAt);
    this._username = props.username;
    this._fullName = props.fullName;
    this._avatarUrl = props.avatarUrl;
  }

  /**
   * Factory: create a brand-new user profile.
   */
  static create(
    id: string,
    username: Username,
    fullName: FullName,
    avatarUrl: AvatarUrl,
  ): UserProfile {
    return new UserProfile(id, {
      username,
      fullName,
      avatarUrl,
    });
  }

  /**
   * Factory: reconstitute from persistence.
   */
  static reconstitute(
    id: string,
    props: UserProfileProps,
    createdAt: Date,
    updatedAt: Date,
  ): UserProfile {
    return new UserProfile(id, props, createdAt, updatedAt);
  }

  // ── Getters ───────────────────────────────────────────────

  get username(): Username {
    return this._username;
  }

  get fullName(): FullName {
    return this._fullName;
  }

  get avatarUrl(): AvatarUrl {
    return this._avatarUrl;
  }

  // ── Domain behaviour ──────────────────────────────────────

  /**
   * Update the username.
   * Should check uniqueness before calling this method.
   */
  updateUsername(username: Username): void {
    if (this.isDeleted()) {
      throw new UserAlreadyDeletedException();
    }
    this._username = username;
    this.touch();
  }

  /**
   * Update the full name.
   */
  updateFullName(fullName: FullName): void {
    if (this.isDeleted()) {
      throw new UserAlreadyDeletedException();
    }
    this._fullName = fullName;
    this.touch();
  }

  /**
   * Update the avatar URL.
   */
  updateAvatarUrl(avatarUrl: AvatarUrl): void {
    if (this.isDeleted()) {
      throw new UserAlreadyDeletedException();
    }
    this._avatarUrl = avatarUrl;
    this.touch();
  }

  /**
   * Soft-delete the user profile.
   */
  delete(): void {
    if (this.isDeleted()) {
      throw new UserAlreadyDeletedException();
    }
    this.softDelete();
  }

  /**
   * Restore a soft-deleted user profile.
   */
  restore(): void {
    if (!this.isDeleted()) {
      throw new Error('User profile is not deleted.');
    }
    this._deletedAt = null;
    this.touch();
  }
}
