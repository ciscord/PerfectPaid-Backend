import { Injectable, BadRequestException } from '@nestjs/common';
import { SendGridService } from '@anchan828/nest-sendgrid';
import * as Sentry from '@sentry/minimal';

@Injectable()
export class SendEmailService {
  constructor(private readonly sendGrid: SendGridService) {}
  async sendEmail(email: string, subject: string, message: string) {
    try {
      return await this.sendGrid.send({
        to: [email],
        from: 'info@getperfectpaid.com',
        subject,
        text: message,
        html: `<strong>${message}</strong>`,
      });
    } catch (e) {
      Sentry.captureException(e);
      throw new BadRequestException(`Could not send email to ${email}.`);
    }
  }
}
