import {
  Controller,
  Headers,
  Get,
  Post,
  Body,
  Req,
  UnauthorizedException,
  UseGuards,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserId } from 'src/common/decorators/user-id.decorator';
import { AstraService } from './astra.service';
import { AstraWebhookDto } from './dto/astra-webhook.dto';
import { GetAccountsQueryDto } from './dto/get-accounts-query.dto';

@Controller('astra')
export class AstraController {
  constructor(private readonly astraService: AstraService) {}

  @Get('redirect')
  async redirect() {
    return { message: 'ok' };
  }

  @UseGuards(AuthGuard())
  @Get('accounts')
  getAccounts(
    @UserId() userId: string,
    @Query() getAccountsQuery: GetAccountsQueryDto,
  ) {
    return this.astraService.getAccounts(userId, getAccountsQuery);
  }

  @UseGuards(AuthGuard())
  @Get('accounts/refresh')
  async resfreshAccounts(@UserId() userId: string) {
    await this.astraService.refreshAccounts(userId);
    const accounts = await this.astraService.getAccounts(userId);
    return accounts;
  }

  @UseGuards(AuthGuard())
  @Patch('accounts/:id/set-primary')
  updateAccount(@UserId() userId: string, @Param('id') accountId: string) {
    return this.astraService.setPrimaryAstraAccount(userId, accountId);
  }

  @Post(['webhook', 'webhooks'])
  async webhook(
    @Headers('Astra-Verification') astraVerification: string,
    // We use any because we stored rawBody
    @Req() request: any,
    @Body()
    astraWebhookDto: AstraWebhookDto,
  ) {
    if (
      !this.astraService.isWebhookAuthenticated(
        astraVerification,
        request.rawBody,
      )
    ) {
      throw new UnauthorizedException('Failed Astra authentication.');
    }

    await this.astraService.webHookUpdate(astraWebhookDto);
  }
}
