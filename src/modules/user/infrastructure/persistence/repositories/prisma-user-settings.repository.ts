import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { IUserSettingsRepository } from '@modules/user/domain/repositories/user-settings.repository';
import { UserSettings } from '@modules/user/domain/entities/user-settings.entity';
import { UserSettingsMapper } from '../mapper/user-settings.mapper';

@Injectable()
export class PrismaUserSettingsRepository implements IUserSettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(userSettings: UserSettings): Promise<void> {
    const data = UserSettingsMapper.toOrm(userSettings);
    await this.prisma.userSettings.create({ data });
  }

  async findById(id: string): Promise<UserSettings | null> {
    const row = await this.prisma.userSettings.findUnique({ where: { id } });
    if (!row) return null;
    return UserSettingsMapper.toDomain(row);
  }

  async findByUserId(userId: string): Promise<UserSettings | null> {
    const row = await this.prisma.userSettings.findUnique({
      where: { userId },
    });
    if (!row) return null;
    return UserSettingsMapper.toDomain(row);
  }

  async update(userSettings: UserSettings): Promise<void> {
    const data = UserSettingsMapper.toOrm(userSettings);
    await this.prisma.userSettings.update({
      where: { id: data.id },
      data,
    });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.prisma.userSettings.deleteMany({ where: { userId } });
  }
}
