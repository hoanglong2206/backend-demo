import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { IEmailVerificationRepository } from '@modules/auth/domain/repositories/email-verification.repository';
import { EmailVerification } from '@modules/auth/domain/entities/email-verification.entity';
import { EmailVerificationMapper } from '../mapper/email-verification.mapper';

@Injectable()
export class PrismaEmailVerificationRepository implements IEmailVerificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(emailVerification: EmailVerification): Promise<void> {
    const data = EmailVerificationMapper.toOrm(emailVerification);
    await this.prisma.emailVerification.create({ data });
  }

  async findById(id: string): Promise<EmailVerification | null> {
    const row = await this.prisma.emailVerification.findUnique({
      where: { id },
    });
    if (!row) return null;
    return EmailVerificationMapper.toDomain(row);
  }

  async findLatestByUserId(userId: string): Promise<EmailVerification | null> {
    const row = await this.prisma.emailVerification.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    if (!row) return null;
    return EmailVerificationMapper.toDomain(row);
  }

  async findLatestByEmail(email: string): Promise<EmailVerification | null> {
    const row = await this.prisma.emailVerification.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' },
    });
    if (!row) return null;
    return EmailVerificationMapper.toDomain(row);
  }

  async update(emailVerification: EmailVerification): Promise<void> {
    const data = EmailVerificationMapper.toOrm(emailVerification);
    await this.prisma.emailVerification.update({
      where: { id: data.id },
      data,
    });
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    await this.prisma.emailVerification.deleteMany({
      where: { userId },
    });
  }
}
