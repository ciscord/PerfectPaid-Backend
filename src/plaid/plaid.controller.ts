import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import plaidClient from './plaid-client';
import { PlaidService } from './plaid.service';
import { PlaidItem } from './entities/plaid-item.entity';
import { User } from '../users/entities/user.entity';
import { SentryInterceptor } from 'src/common/interceptors/sentry.interceptor';

@UseInterceptors(SentryInterceptor)
@Controller('plaid')
export class PlaidController {
  constructor(private readonly plaidService: PlaidService) {}

  @UseGuards(AuthGuard())
  @Post()
  async create(@Req() req: Request) {
    const user: any = req.user;
    const configs = {
      user: {
        // This should correspond to a unique id for the current user.
        client_user_id: user.sub,
      },
      client_name: 'Well Paid',
      country_codes: ['US'],
      language: 'en',
      products: ['transactions'],
      webhook: process.env.PLAID_WEBHOOK_URL,
      access_token: null,
    };

    try {
      return await plaidClient.createLinkToken(configs);
    } catch (e) {
      throw e;
    }
  }

  @UseGuards(AuthGuard())
  @Post('/item')
  async createItem(@Req() req: Request, @Body() body) {
    const { sub: userId }: any = req.user;
    const { publicToken, institutionId /* userId */ } = body;
    const user = await User.findOne(userId);
    const existingPlaidItem = await PlaidItem.findOne({
      where: {
        plaidInstitutionId: institutionId,
      },
    });

    if (existingPlaidItem) {
      throw new HttpException(
        'You have already linked an item at this institution.',
        HttpStatus.CONFLICT,
      );
    }

    const {
      item_id: plaidItemId,
      access_token: plaidAccessToken,
    } = await plaidClient.exchangePublicToken(publicToken);

    return this.plaidService.createItem({
      plaidInstitutionId: institutionId,
      plaidAccessToken,
      plaidItemId,
      status: '',
      user,
    });
  }

  @Post('/webhook')
  async webhook(@Body() body) {
    switch (body.webhook_type) {
      case 'TRANSACTIONS':
        await this.plaidService.handleTransactionsWebhook(body);
        break;

      default:
        break;
    }

    return {};
  }
}
