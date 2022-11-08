import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectTwilio, TwilioClient } from 'nestjs-twilio';

@Injectable()
export class TwilioService {
  public constructor(@InjectTwilio() private readonly client: TwilioClient) {}
  async sendSMS(phone: string, message: string): Promise<any> {
    try {
      return await this.client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      });
    } catch (e) {
      throw new HttpException(
        {
          message: `Can not send sms to ${phone}. check ${e.moreInfo}`,
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
