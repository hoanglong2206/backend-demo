import { BaseEntity } from '@shared/common/kernel/base.entity';

interface UserSettingsProps {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  twoFactorEnabled: boolean;
}

/**
 * Entity representing user settings and preferences.
 *
 * WHY: Encapsulates user-specific settings and preferences,
 * allowing users to customize their experience while keeping
 * settings separate from core profile data.
 */
export class UserSettings extends BaseEntity {
  private _userId: string;
  private _emailNotifications: boolean;
  private _pushNotifications: boolean;
  private _theme: 'light' | 'dark' | 'auto';
  private _language: string;
  private _twoFactorEnabled: boolean;

  private static readonly SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de', 'ja'];
  private static readonly SUPPORTED_THEMES = ['light', 'dark', 'auto'] as const;

  private constructor(id: string, props: UserSettingsProps, createdAt?: Date) {
    super(id, createdAt);
    this._userId = props.userId;
    this._emailNotifications = props.emailNotifications;
    this._pushNotifications = props.pushNotifications;
    this._theme = props.theme;
    this._language = props.language;
    this._twoFactorEnabled = props.twoFactorEnabled;
  }

  /**
   * Factory: create default settings for a new user.
   */
  static createDefault(id: string, userId: string): UserSettings {
    return new UserSettings(id, {
      userId,
      emailNotifications: true,
      pushNotifications: true,
      theme: 'auto',
      language: 'en',
      twoFactorEnabled: false,
    });
  }

  /**
   * Factory: reconstitute from persistence.
   */
  static reconstitute(
    id: string,
    props: UserSettingsProps,
    createdAt: Date,
  ): UserSettings {
    return new UserSettings(id, props, createdAt);
  }

  // ── Getters ───────────────────────────────────────────────

  get userId(): string {
    return this._userId;
  }

  get emailNotifications(): boolean {
    return this._emailNotifications;
  }

  get pushNotifications(): boolean {
    return this._pushNotifications;
  }

  get theme(): 'light' | 'dark' | 'auto' {
    return this._theme;
  }

  get language(): string {
    return this._language;
  }

  get twoFactorEnabled(): boolean {
    return this._twoFactorEnabled;
  }

  // ── Domain behaviour ──────────────────────────────────────

  /**
   * Update email notification preference.
   */
  setEmailNotifications(enabled: boolean): void {
    this._emailNotifications = enabled;
  }

  /**
   * Update push notification preference.
   */
  setPushNotifications(enabled: boolean): void {
    this._pushNotifications = enabled;
  }

  /**
   * Update theme preference.
   */
  setTheme(theme: 'light' | 'dark' | 'auto'): void {
    if (!UserSettings.SUPPORTED_THEMES.includes(theme)) {
      throw new Error(`Unsupported theme: ${theme}`);
    }
    this._theme = theme;
  }

  /**
   * Update language preference.
   */
  setLanguage(language: string): void {
    if (!UserSettings.SUPPORTED_LANGUAGES.includes(language)) {
      throw new Error(`Unsupported language: ${language}`);
    }
    this._language = language;
  }

  /**
   * Enable two-factor authentication.
   */
  enableTwoFactor(): void {
    this._twoFactorEnabled = true;
  }

  /**
   * Disable two-factor authentication.
   */
  disableTwoFactor(): void {
    this._twoFactorEnabled = false;
  }

  /**
   * Disable all notifications.
   */
  disableAllNotifications(): void {
    this._emailNotifications = false;
    this._pushNotifications = false;
  }

  /**
   * Enable all notifications.
   */
  enableAllNotifications(): void {
    this._emailNotifications = true;
    this._pushNotifications = true;
  }
}
