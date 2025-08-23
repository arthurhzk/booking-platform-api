import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(email: string, message: string) {
    await this.mailerService.sendMail({
      to: email,
      from: process.env.EMAIL_FROM,
      subject: 'Notification from Our Service',
      text: message,
      html: `<p>${message}</p>`,
    });
  }
}
