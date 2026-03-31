/**
 * ORM representation of the `user_profile` table (Prisma `UserProfile` model).
 *
 * This is a plain data interface that mirrors the database row exactly.
 * It serves as the persistence-layer DTO — no domain logic belongs here.
 */
export interface UserProfileOrm {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
