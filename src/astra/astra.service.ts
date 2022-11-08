import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { DateTime } from 'luxon';
import { Producer } from 'sqs-producer';
import { Status, User } from 'src/users/entities/user.entity';
import { Between, In } from 'typeorm';
import { AstraClient } from './astra-api-client';
import { AstraWebhookDto, WebhookType } from './dto/astra-webhook.dto';
import { AstraAccount } from './entities/astra-account.entity';
import { AstraAccount as AstraAccountInterface } from './interfaces/astra-account.interface';
import { AstraTransaction } from './entities/astra-transaction.entity';
import { AstraTransactions } from './interfaces/astra-transactions.interface';
import { Message } from 'sqs-producer/dist/types';

const DATE_FORMAT = 'yyyy-LL-dd';
const producer = Producer.create({
  queueUrl: process.env.AWS_SQS_DATA_SCIENCE_REGION,
  region: process.env.AWS_SQS_DATA_SCIENCE_URL,
});

@Injectable()
export class AstraService {
  async refreshAccounts(userId: string) {
    const user = await User.findOne(userId);

    const astraClient = new AstraClient(user.accessToken);
    const accounts = await astraClient.getAccounts();
    for (const account of accounts) {
      await this.createOrUpdateAstraAccount(user, account);
    }

    user.status = Status.Connected;
    await user.save();
  }

  createOrUpdateAstraAccount(
    user: User,
    account: AstraAccountInterface,
  ): Promise<AstraAccount> {
    // Note: we explicitly write every column because we need to convert from snake to camel case
    return AstraAccount.create({
      id: account.id,
      user,
      officialName: account.official_name,
      name: account.name,
      nickname: account.nickname,
      mask: account.mask,
      institutionName: account.institution_name,
      institutionLogo: account.institution_logo,
      type: account.type,
      subtype: account.subtype,
      currentBalance: account.current_balance,
      availableBalance: account.available_balance,
      lastBalanceUpdateOn: account.last_balance_update_on,
      connectionStatus: account.connection_status,
    }).save();
  }

  async setPrimaryAstraAccount(
    userId: string,
    accountId: string,
  ): Promise<AstraAccount> {
    const account = await AstraAccount.findOne({
      id: accountId,
      user: {
        id: userId,
      },
    });

    if (!account) {
      throw new NotFoundException('Account not found.');
    }

    // Set all user's accounts to false
    await AstraAccount.update({ user: { id: userId } }, { isPrimary: false });
    account.isPrimary = true;

    return account.save();
  }

  getAccounts(
    userId: string,
    getAccountsQueryDto = {},
  ): Promise<AstraAccount[]> {
    return AstraAccount.find({
      user: {
        id: userId,
      },
      ...getAccountsQueryDto,
    });
  }

  isWebhookAuthenticated(
    astraVerification: string,
    astraWebhookDto: string,
  ): boolean {
    const decodedAstraVerification = Buffer.from(astraVerification, 'base64');
    const hmac = crypto
      .createHmac('sha256', process.env.ASTRA_CLIENT_SECRET)
      .update(astraWebhookDto);
    const hmacDigest = hmac.digest();

    return (
      decodedAstraVerification.length === hmacDigest.length &&
      crypto.timingSafeEqual(decodedAstraVerification, hmacDigest)
    );
  }

  async webHookUpdate(astraWebhookDto: AstraWebhookDto) {
    const {
      webhook_type: webhookType,
      user_id: astraUserId,
      resource_id: accountId,
    } = astraWebhookDto;

    const user = await User.findOne({
      astraUserId,
    });

    if (!user.accessToken) {
      throw new BadRequestException('No user access token found.');
    } else {
      await this.refreshAccounts(user.id);
    }

    switch (webhookType) {
      case WebhookType.TRANSACTIONS_DEFAULT_UPDATE: {
        const startDate = DateTime.now()
          .minus({
            days: 14,
          })
          .toFormat(DATE_FORMAT);
        const endDate = DateTime.now().toFormat(DATE_FORMAT);
        await this.updateAstraTransactions(user, accountId, startDate, endDate);
        break;
      }

      case WebhookType.TRANSACTIONS_HISTORICAL_UPDATE: {
        const startDate = DateTime.now()
          .minus({
            years: 2,
          })
          .toFormat(DATE_FORMAT);
        const endDate = DateTime.now().toFormat(DATE_FORMAT);
        await this.updateAstraTransactions(user, accountId, startDate, endDate);
        break;
      }

      case WebhookType.TRANSACTIONS_REMOVED:
        await this.removeAstraTransactions(
          accountId,
          astraWebhookDto.removed_transactions,
        );
        break;

      default:
        break;
    }

    const message: Message = {
      id: uuidv4(),
      body: JSON.stringify({
        user_id: user.id,
        message_type: webhookType,
      }),
    };
    await producer.send(message);
  }

  async updateAstraTransactions(
    user: User,
    accountId: string,
    startDate: string,
    endDate: string,
  ) {
    let astraTransactions: AstraTransactions;
    const astraClient = new AstraClient(user.accessToken);
    const existingTransactions = await AstraTransaction.find({
      account: {
        id: accountId,
      },
      date: Between(startDate, endDate),
    });
    const existingTransactionIds = existingTransactions.reduce(
      (idMap, { id }) => ({
        ...idMap,
        [id]: id,
      }),
      {},
    );

    // Go fetch account from astra
    const astraAccount = await astraClient.getAccountById(accountId);
    const accountEntity = await this.createOrUpdateAstraAccount(
      user,
      astraAccount,
    );

    let cursor: string;
    do {
      astraTransactions = await astraClient.getTransactions(
        accountId,
        startDate,
        endDate,
        cursor,
      );

      if (astraTransactions.transactions) {
        for (const transaction of astraTransactions.transactions) {
          // TODO: might have to do a try catch and ignore duplicate entry errors
          // Do not add duplicate transactions
          // Note: we explicitly write every column because we need to convert from snake to camel case
          if (!existingTransactionIds[transaction.id]) {
            await AstraTransaction.create({
              id: transaction.id,
              user,
              account: accountEntity,
              name: transaction.name,
              merchantName: transaction.merchant_name,
              amount: transaction.amount,
              date: transaction.date,
              category: transaction.category,
              categoryId: transaction.category_id,
              locationAddress: transaction.location_address,
              locationCity: transaction.location_city,
              locationState: transaction.location_state,
              locationStoreNumber: transaction.location_store_number,
              locationZip: transaction.location_zip,
              pending: transaction.pending,
            }).save();
          }
        }
      }

      cursor = astraTransactions.cursor;
    } while (astraTransactions.more);
  }

  removeAstraTransactions(accountId: string, removeTransIds: string[]) {
    return AstraTransaction.delete({
      id: In(removeTransIds),
      account: {
        id: accountId,
      },
    });
  }
}
