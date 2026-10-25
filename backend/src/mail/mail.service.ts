import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
}

/**
 * Gửi email. Có cấu hình SMTP (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM) thì gửi thật;
 * không thì CHỈ ghi nội dung thư ra log (chế độ phát triển) để vẫn thử được luồng mà không cần máy chủ thư.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    if (process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
      });
    }
  }

  get isConfigured(): boolean {
    return this.transporter !== null;
  }

  async send(message: MailMessage): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(`[CHƯA CẤU HÌNH SMTP — chế độ dev] Thư tới ${message.to}\n${message.subject}\n${message.text}`);
      return;
    }
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM ?? 'Study & Work <no-reply@localhost>',
      to: message.to,
      subject: message.subject,
      text: message.text,
    });
  }
}
