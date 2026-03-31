/**
 * ORM representation of the `user_settings` table (Prisma `UserSettings` model).
 *
 * This is a plain data interface that mirrors the database row exactly.
 * It serves as the persistence-layer DTO — no domain logic belongs here.
 */
export interface UserSettingsOrm {
  id: string;
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  theme: string;
  language: string;
  twoFactorEnabled: boolean;
  createdAt: Date;
}
