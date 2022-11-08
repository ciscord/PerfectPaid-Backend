import { Injectable } from '@nestjs/common';
import {
  SqsConsumerEventHandler,
  SqsMessageHandler,
  SqsService,
} from '@ssut/nestjs-sqs';
import { DateTime } from 'luxon';
import { TransferTiming } from 'src/split-bills/entities/split-bill.entity';
import { SplitBillsService } from 'src/split-bills/split-bills.service';
import { TransfersService } from 'src/transfers/transfers.service';
import { Consumer, ErrorEvents } from 'src/common/utils/sqs';
import {
  SQSMessage,
  SQSMessageCreateTransfer,
  SQSMessageSplitBill,
  Type,
} from './interfaces/sqs-message.interface';

@Injectable()
export class WorkerService {
  public constructor(
    private readonly sqsService: SqsService,
    private splitBillsService: SplitBillsService,
    private transferService: TransfersService,
  ) {}

  @SqsMessageHandler(Consumer.name, false)
  public async handleMessage(message: AWS.SQS.Message) {
    const sqsMessage: SQSMessage = JSON.parse(message.Body);

    switch (sqsMessage.type) {
      case Type.SplitBill:
        await this.createBillSplitTransaction(
          sqsMessage as SQSMessageSplitBill,
        );
        break;

      case Type.RecurringTransfer:
        await this.createTransfer(sqsMessage as SQSMessageCreateTransfer);
        break;

      default:
        break;
    }
  }

  async createBillSplitTransaction(sqsMessage: SQSMessageSplitBill) {
    const date = DateTime.now().toUTC();
    const splitBill = await this.splitBillsService.findOne({
      where: {
        transferTiming: TransferTiming.AfterBillPaid,
        accepted: true,
        transactionSeries: {
          id: sqsMessage.transactionSeriesId,
        },
      },
      relations: ['user', 'userToSplitWith', 'connection'],
    });
    await this.splitBillsService.createSplitBillTransaction(
      splitBill,
      date,
      sqsMessage.categorizedTransactionId,
    );
  }

  async createTransfer(sqsMessage: SQSMessageCreateTransfer) {
    const recurringTransfer =
      await this.transferService.findOneRecurringTransfers({
        where: {
          id: sqsMessage.recurringTransferId,
        },
        relations: ['from', 'to', 'astraAccount'],
      });

    try {
      await this.transferService.createTransfer(recurringTransfer);
    } catch (e) {}
  }

  @SqsConsumerEventHandler(Consumer.name, ErrorEvents.processingError)
  public onProcessingError(error: Error, message: AWS.SQS.Message) {
    console.log(error);
  }
}
