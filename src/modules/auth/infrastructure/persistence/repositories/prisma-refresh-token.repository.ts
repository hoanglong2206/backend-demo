import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { IRefreshTokenRepository } from '@modules/auth/domain/repositories/refresh-token.repository';
import { RefreshToken } from '@modules/auth/domain/entities/refresh-token.entity';
import { RefreshTokenMapper } from '../mapper/refresh-token.mapper';

@Injectable()
export class PrismaRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(refreshToken: RefreshToken): Promise<void> {
    const data = RefreshTokenMapper.toOrm(refreshToken);
    await this.prisma.refreshToken.create({ data });
  }

  async findById(id: string): Promise<RefreshToken | null> {
    const row = await this.prisma.refreshToken.findUnique({
      where: { id },
    });
    if (!row) return null;
    return RefreshTokenMapper.toDomain(row);
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const row = await this.prisma.refreshToken.findFirst({
      where: { token },
    });
    if (!row) return null;
    return RefreshTokenMapper.toDomain(row);
  }

  async findActiveByUserId(userId: string): Promise<RefreshToken[]> {
    const rows = await this.prisma.refreshToken.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
    });
    return rows.map(RefreshTokenMapper.toDomain);
  }

  async update(refreshToken: RefreshToken): Promise<void> {
    const data = RefreshTokenMapper.toOrm(refreshToken);
    await this.prisma.refreshToken.update({
      where: { id: data.id },
      data,
    });
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    // Since `revokedAt` is not in the DB schema yet,
    // we delete the tokens instead as a revocation mechanism.
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  async deleteExpiredBefore(date: Date): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: date } },
    });
  }
}
