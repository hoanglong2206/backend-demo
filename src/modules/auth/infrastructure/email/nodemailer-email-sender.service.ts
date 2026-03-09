import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Nodemailer implementation of an email sender service.
 *
 * Reads SMTP configuration from the NestJS ConfigService using
 * the `mail.*` config namespace. Falls back to safe defaults
 * suitable for development (e.g. Ethereal / MailHog).
 *
 * Config keys:
 *   mail.host     - SMTP host (default: localhost)
 *   mail.port     - SMTP port (default: 1025)
 *   mail.secure   - Use TLS (default: false)
 *   mail.user     - SMTP username (optional)
 *   mail.password - SMTP password (optional)
 *   mail.from     - Default sender address
 */
@Injectable()
export class NodemailerEmailSenderService {
  private readonly logger = new Logger(NodemailerEmailSenderService.name);
  private readonly transporter: Transporter;
  private readonly defaultFrom: string;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('mail.host', 'localhost');
    const port = this.configService.get<number>('mail.port', 1025);
    const secure = this.configService.get<boolean>('mail.secure', false);
    const user = this.configService.get<string>('mail.user');
    const password = this.configService.get<string>('mail.password');
    this.defaultFrom = this.configService.get<string>(
      'mail.from',
      'noreply@example.com',
    );

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      ...(user && password ? { auth: { user, pass: password } } : {}),
    });
  }

  /**
   * Send an email.
   */
  async sendEmail(options: SendEmailOptions): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: this.defaultFrom,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      this.logger.log(
        `Email sent to ${options.to} — messageId: ${info.messageId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error);
      throw error;
    }
  }

  /**
   * Send an OTP verification email.
   */
  async sendOtpEmail(to: string, otpCode: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Your verification code',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Email Verification</h2>
          <p>Your verification code is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px;
                      background: #f4f4f4; padding: 16px 24px; border-radius: 8px;
                      text-align: center; margin: 16px 0;">
            ${otpCode}
          </div>
          <p style="color: #666;">This code expires in 10 minutes. If you did not
          request this, please ignore this email.</p>
        </div>
      `,
      text: `Your verification code is: ${otpCode}. This code expires in 10 minutes.`,
    });
  }
}
