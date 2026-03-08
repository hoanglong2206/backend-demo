import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { IUserCredentialRepository } from '@modules/auth/domain/repositories/user-credential.repository';
import { UserCredential } from '@modules/auth/domain/entities/user-credential.entity';
import { Email } from '@modules/auth/domain/value-objects/email.vo';
import { UserCredentialMapper } from '../mapper/user-credential.mapper';

@Injectable()
export class PrismaUserCredentialRepository implements IUserCredentialRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(userCredential: UserCredential): Promise<void> {
    const data = UserCredentialMapper.toOrm(userCredential);
    await this.prisma.auth.create({ data });
  }

  async findById(id: string): Promise<UserCredential | null> {
    const row = await this.prisma.auth.findUnique({ where: { id } });
    if (!row) return null;
    return UserCredentialMapper.toDomain(row);
  }

  async findByEmail(email: Email): Promise<UserCredential | null> {
    const row = await this.prisma.auth.findUnique({
      where: { email: email.value },
    });
    if (!row) return null;
    return UserCredentialMapper.toDomain(row);
  }

  async findByProviderId(
    provider: string,
    providerId: string,
  ): Promise<UserCredential | null> {
    const row = await this.prisma.auth.findFirst({
      where: { authProviders: provider, providerId },
    });
    if (!row) return null;
    return UserCredentialMapper.toDomain(row);
  }

  async update(userCredential: UserCredential): Promise<void> {
    const data = UserCredentialMapper.toOrm(userCredential);
    await this.prisma.auth.update({
      where: { id: data.id },
      data,
    });
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const count = await this.prisma.auth.count({
      where: { email: email.value },
    });
    return count > 0;
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.auth.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
