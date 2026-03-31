import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { IUserProfileRepository } from '@modules/user/domain/repositories/user-profile.repository';
import { UserProfile } from '@modules/user/domain/entities/user-profile.entity';
import { Username } from '@modules/user/domain/value-objects/username.vo';
import { UserProfileMapper } from '../mapper/user-profile.mapper';

@Injectable()
export class PrismaUserProfileRepository implements IUserProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(userProfile: UserProfile): Promise<void> {
    const data = UserProfileMapper.toOrm(userProfile);
    await this.prisma.userProfile.create({ data });
  }

  async findById(id: string): Promise<UserProfile | null> {
    const row = await this.prisma.userProfile.findUnique({ where: { id } });
    if (!row) return null;
    return UserProfileMapper.toDomain(row);
  }

  async findByUsername(username: Username): Promise<UserProfile | null> {
    const row = await this.prisma.userProfile.findUnique({
      where: { username: username.value },
    });
    if (!row) return null;
    return UserProfileMapper.toDomain(row);
  }

  async update(userProfile: UserProfile): Promise<void> {
    const data = UserProfileMapper.toOrm(userProfile);
    await this.prisma.userProfile.update({
      where: { id: data.id },
      data,
    });
  }

  async existsByUsername(username: Username): Promise<boolean> {
    const count = await this.prisma.userProfile.count({
      where: { username: username.value },
    });
    return count > 0;
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.userProfile.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findActive(skip: number, take: number): Promise<UserProfile[]> {
    const rows = await this.prisma.userProfile.findMany({
      where: { deletedAt: null },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => UserProfileMapper.toDomain(row));
  }

  async countActive(): Promise<number> {
    return this.prisma.userProfile.count({ where: { deletedAt: null } });
  }
}
