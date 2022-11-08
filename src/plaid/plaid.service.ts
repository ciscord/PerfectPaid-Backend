import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import { Repository } from 'typeorm';
import { Producer } from 'sqs-producer';
import { CreateItemDto } from './dto/create-item.dto';
import { PlaidItem } from './entities/plaid-item.entity';
import { PlaidAccount } from './entities/plaid-account.entity';
import { PlaidTransaction } from './entities/plaid-transaction.entity';
import plaidClient from './plaid-client';

const producer = Producer.create({
  queueUrl: process.env.AWS_SQS_DATA_SCIENCE_URL,
  region: process.env.AWS_SQS_DATA_SCIENCE_REGION,
});

@Injectable()
export class PlaidService {
  constructor(
    @InjectRepository(PlaidTransaction)
    private transactionsRepository: Repository<PlaidTransaction>,
    @InjectRepository(PlaidAccount)
    private accountsRepository: Repository<PlaidAccount>,
  ) {}

  createItem(item: CreateItemDto): Promise<PlaidItem> {
    return PlaidItem.create(item).save();
  }

  async handleTransactionsWebhook(plaidWebhook: any) {
    const {
      webhook_code: webhookCode,
      item_id: plaidItemId,
      new_transactions: newTransactions,
      removed_transactions: removedTransactions,
    } = plaidWebhook;

    switch (webhookCode) {
      case 'INITIAL_UPDATE': {
        const startDate = DateTime.now()
          .minus({
            days: 30,
          })
          .toFormat('yyyy-LL-dd');
        const endDate = DateTime.now().toFormat('yyyy-LL-dd');
        await this.updateTransactions(plaidItemId, startDate, endDate);
        break;
      }

      case 'HISTORICAL_UPDATE': {
        const startDate = DateTime.now()
          .minus({
            years: 2,
          })
          .toFormat('yyyy-LL-dd');
        const endDate = DateTime.now().toFormat('yyyy-LL-dd');
        const item = await PlaidItem.findOne({
          where: {
            plaidItemId,
          },
          relations: ['user'],
        });
        await this.updateTransactions(plaidItemId, startDate, endDate);
        await producer.send(
          JSON.stringify({
            // user_id: item.user.id,
            message_type: 'signup',
          }),
        );
        break;
      }

      case 'DEFAULT_UPDATE': {
        const startDate = DateTime.now()
          .minus({
            days: 14,
          })
          .toFormat('yyyy-LL-dd');
        const endDate = DateTime.now().toFormat('yyyy-LL-dd');
        await this.updateTransactions(plaidItemId, startDate, endDate);
        break;
      }

      case 'TRANSACTIONS_REMOVED':
        break;

      default:
        console.log('unhandled webhook code:', webhookCode);
        break;
    }
  }

  async updateTransactions(
    plaidItemId: string,
    startDate: string,
    endDate: string,
  ) {
    // Fetch new transactions from plaid api.
    const { transactions: incomingTransactions, accounts } =
      await this.fetchTransactions(plaidItemId, startDate, endDate);
    const existingTransactions = await this.transactionsRepository
      .createQueryBuilder('transaction')
      .leftJoin('transaction.plaidAccount', 'account')
      .leftJoin(
        'account.plaidItem',
        'item',
        'item.plaid_item_id = :plaidItemId',
      )
      .where('date >= :startDate')
      .andWhere('date <= :endDate')
      .setParameter('plaidItemId', plaidItemId)
      .setParameter('startDate', startDate)
      .setParameter('endDate', endDate)
      .execute();

    // Compare to find new transactions.
    const existingTransactionIds = existingTransactions.reduce(
      (idMap, { plaidTransactionId }) => ({
        ...idMap,
        [plaidTransactionId]: plaidTransactionId,
      }),
      {},
    );
    const transactionsToStore = incomingTransactions.filter(
      ({ transaction_id: plaidTransactionId }) => {
        const isExisting = existingTransactionIds[plaidTransactionId];
        return !isExisting;
      },
    );

    // // Compare to find removed transactions (pending transactions that have posted or cancelled).
    // const incomingTransactionIds = incomingTransactions.reduce(
    //   (idMap, { transaction_id: plaidTransactionId }) => ({
    //     ...idMap,
    //     [plaidTransactionId]: plaidTransactionId,
    //   }),
    //   {},
    // );
    // const transactionsToRemove = existingTransactions.filter(
    //   ({ plaid_transaction_id: plaidTransactionId }) => {
    //     const isIncoming = incomingTransactionIds[plaidTransactionId];
    //     return !isIncoming;
    //   },
    // );

    const plaidItem = await PlaidItem.findOne({
      where: {
        plaidItemId,
      },
      relations: ['user'],
    });

    for (const account of accounts) {
      const {
        account_id: plaidAccountId,
        name,
        mask,
        official_name: officialName,
        balances: {
          available: availableBalance,
          current: currentBalance,
          iso_currency_code: isoCurrencyCode,
          limit,
          unofficial_currency_code: unofficialCurrencyCode,
        },
        type,
        subtype,
      } = account;
      const accountEntity = new PlaidAccount();
      accountEntity.plaidItem = plaidItem;
      // accountEntity.user = plaidItem.user;
      accountEntity.plaidAccountId = plaidAccountId;
      accountEntity.name = name;
      accountEntity.mask = mask;
      accountEntity.officialName = officialName;
      accountEntity.availableBalance = availableBalance;
      accountEntity.currentBalance = currentBalance;
      accountEntity.isoCurrencyCode = isoCurrencyCode;
      accountEntity.unofficialCurrencyCode = unofficialCurrencyCode;
      accountEntity.type = type;
      accountEntity.subtype = subtype;
      accountEntity.limit = limit;

      const existingAccount = await PlaidAccount.findOne({
        where: {
          plaidAccountId,
        },
      });

      if (!existingAccount) {
        await accountEntity.save();
      }
    }

    for (const transaction of transactionsToStore) {
      const {
        account_id: plaidAccountId,
        transaction_id: plaidTransactionId,
        account_owner: accountOwner,
        pending_transaction_id: pendingTransactionId,
        pending,
        payment_channel: paymentChannel,
        payment_meta: paymentMeta,
        name,
        merchant_name: merchantName,
        location,
        authorized_date: authorizedDate,
        date,
        category_id: plaidCategoryId,
        category: categories,
        unofficial_currency_code: unofficialCurrencyCode,
        iso_currency_code: isoCurrencyCode,
        amount,
        transaction_type: type,
        transaction_code: transactionCode,
      } = transaction;
      const account = await PlaidAccount.findOne({
        where: {
          plaidAccountId,
        },
      });
      const [category, subcategory] = categories;
      const transactionEntity = new PlaidTransaction();
      // transactionEntity.user = plaidItem.user;
      transactionEntity.plaidAccount = account;
      transactionEntity.plaidTransactionId = plaidTransactionId;
      transactionEntity.accountOwner = accountOwner;
      transactionEntity.pendingTransactionId = pendingTransactionId;
      transactionEntity.pending = pending;
      transactionEntity.paymentChannel = paymentChannel;
      transactionEntity.paymentMeta = paymentMeta;
      transactionEntity.name = name;
      transactionEntity.merchantName = merchantName;
      transactionEntity.location = location;
      transactionEntity.authorizedDate = authorizedDate;
      transactionEntity.date = date;
      transactionEntity.plaidCategoryId = plaidCategoryId;
      transactionEntity.category = category;
      transactionEntity.subcategory = subcategory;
      transactionEntity.unofficialCurrencyCode = unofficialCurrencyCode;
      transactionEntity.isoCurrencyCode = isoCurrencyCode;
      transactionEntity.amount = amount;
      transactionEntity.type = type;
      transactionEntity.transactionCode = transactionCode;

      try {
        await transactionEntity.save();
      } catch (e) {
        // this is most likely a duplicate transaction, so we'll ignore it.
        console.log(`Skipping duplicate transaction ${plaidTransactionId}`);
      }
    }

    // await deleteTransactions(transactionsToRemove);
  }

  async fetchTransactions(
    plaidItemId: string,
    startDate: string,
    endDate: string,
  ) {
    try {
      const { plaidAccessToken } = await PlaidItem.findOne({
        where: {
          plaidItemId,
        },
      });

      let offset = 0;
      let transactionsToFetch = true;
      let resultData = {
        transactions: [],
        accounts: [],
      };
      const batchSize = 100;

      while (transactionsToFetch) {
        const options = {
          count: batchSize,
          offset,
        };
        const { transactions, accounts } = await plaidClient.getTransactions(
          plaidAccessToken,
          startDate,
          endDate,
          options,
        );

        resultData = {
          transactions: [...resultData.transactions, ...transactions],
          accounts,
        };

        if (transactions.length === batchSize) {
          offset += batchSize;
        } else {
          transactionsToFetch = false;
        }
      }

      return resultData;
    } catch (e) {
      console.error('Error fetching transactions:', e.message);
      return {
        transactions: [],
        accounts: [],
      };
    }
  }
}
