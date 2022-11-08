import { Injectable, NotFoundException } from '@nestjs/common';
import { SqsService } from '@ssut/nestjs-sqs';
import { DateTime } from 'luxon';
import { AstraClient } from 'src/astra/astra-api-client';
import { AstraAccount } from 'src/astra/entities/astra-account.entity';
import { Type as AstraRoutineType } from 'src/astra/interfaces/astra-routine.interface';
import { DateFormat } from 'src/common/utils/date';
import { ConnectionsService } from 'src/connections/connections.service';
import {
  Connection,
  Status as ConnectionStatus,
} from 'src/connections/entities/connection.entity';
import { User } from 'src/users/entities/user.entity';
import {
  SQSMessageCreateTransfer,
  Type as SQSMessageType,
} from 'src/worker/interfaces/sqs-message.interface';
import { CreateRecurringTransferDto } from './dto/create-recurring-transfer.dto';
import { FindManyOptions } from 'typeorm';
import {
  Frequency,
  RecurringTransfer,
  RepeatUntil,
  Status as RecurringTransferStatus,
} from './entities/recurring-transfer.entity';
import { Transfer } from './entities/transfer.entity';
import { v4 as uuidv4 } from 'uuid';
import { Producer } from 'src/common/utils/sqs';

@Injectable()
export class TransfersService {
  constructor(
    private connectionsService: ConnectionsService,
    private sqsService: SqsService,
  ) {}

  async createRecurringTransfer(
    from: User,
    createRecurringTransferDto: CreateRecurringTransferDto,
  ) {
    const connection = await Connection.findOneOrFail({
      where: [
        {
          id: createRecurringTransferDto.connectionId,
          senderUser: from,
        },
        {
          id: createRecurringTransferDto.connectionId,
          invitedUser: from,
        },
      ],
      relations: ['senderUser', 'invitedUser'],
    }).catch(() => {
      throw new NotFoundException('Connection does not exist');
    });
    // TODO: pending connections
    let to: User;

    if (connection.senderUser && connection.senderUser.id !== from.id) {
      to = connection.senderUser;
    } else if (
      connection.invitedUser &&
      connection.invitedUser.id !== from.id
    ) {
      to = connection.invitedUser;
    }

    // Check if a connection exists to be able to make a transfer
    await this.connectionsService.findConnectionOrFail(
      from,
      to,
      ConnectionStatus.Accepted,
    );

    const astraAccount = await AstraAccount.findOneOrFail(
      createRecurringTransferDto.astraAccountId,
    );

    const recurringTransfer = await RecurringTransfer.create({
      from,
      to,
      type: createRecurringTransferDto.type,
      description: createRecurringTransferDto.description,
      amount: createRecurringTransferDto.amount,
      astraAccount,
      nextDate: createRecurringTransferDto.nextDate,
      frequency: createRecurringTransferDto.frequency,
      repeatUntil: createRecurringTransferDto.repeatUntil,
      repeatUntilNumber: createRecurringTransferDto.repeatUntilNumber || 0,
    }).save();

    if (recurringTransfer.frequency === Frequency.OneTime) {
      await this.sendCreateTransferSQSMessage([recurringTransfer.id]);
    }

    return recurringTransfer;
  }

  async sendCreateTransferSQSMessage(recurringTransferIds: number[]) {
    const messages = recurringTransferIds.map((id) => {
      const body: SQSMessageCreateTransfer = {
        type: SQSMessageType.RecurringTransfer,
        recurringTransferId: id,
      };
      return {
        id: uuidv4(),
        body,
        delaySeconds: 0,
      };
    });

    await this.sqsService.send(Producer.name, messages);
  }

  // In addition to create a transfer object, this also updates the recurring transfer
  // status and nextDate based on whether the transfer completed the recurring transfer
  async createTransfer(recurringTransfer: RecurringTransfer) {
    const {
      from: fromUser,
      to: toUser,
      type,
      description,
      astraAccount: fromAstraAccount,
      amount,
    } = recurringTransfer;

    // Check if a connection exists to be able to make a transfer
    await this.connectionsService.findConnectionOrFail(
      fromUser,
      toUser,
      ConnectionStatus.Accepted,
    );
    const routine = await this.createAstraRoutine(
      fromUser,
      toUser,
      fromAstraAccount,
      amount,
    );

    const transfer = await Transfer.create({
      from: fromUser,
      to: toUser,
      recurringTransfer,
      type,
      description,
      amount,
      astraAccount: fromAstraAccount,
      astraRoutineId: routine.id,
    }).save();

    await RecurringTransfer.update(recurringTransfer.id, {
      status: await this.getNewRecurringTransferStatus(recurringTransfer),
      nextDate: this.getNewRecurringTransferNextDate(recurringTransfer),
    });

    return transfer;
  }

  async createAstraRoutine(
    fromUser: User,
    toUser: User,
    fromAstraAccount: AstraAccount,
    amount: number,
  ) {
    const astraClient = new AstraClient(fromUser.accessToken);
    // The destination_id will always be the "to" user's primary account
    const toAstraAccount = await AstraAccount.findOneOrFail({
      user: toUser,
      isPrimary: true,
    });
    const routine = await astraClient.createRoutine({
      type: AstraRoutineType.OneTime,
      name: 'test',
      active: true,
      source_id: fromAstraAccount.id,
      destination_id: toAstraAccount.id,
      destination_user_id: toUser.astraUserId,
      amount,
      start_date: DateTime.now().toUTC().toFormat(DateFormat),
    });

    return routine;
  }

  async getNewRecurringTransferStatus(
    recurringTransfer: RecurringTransfer,
  ): Promise<RecurringTransferStatus> {
    let status = recurringTransfer.status;
    const transferCount = await Transfer.count({
      recurringTransfer,
    });

    if (recurringTransfer.frequency === Frequency.OneTime) {
      status = RecurringTransferStatus.Done;
    } else if (
      recurringTransfer.repeatUntil === RepeatUntil.NumberOfTransfers &&
      transferCount >= recurringTransfer.repeatUntilNumber
    ) {
      status = RecurringTransferStatus.Done;
    }

    return status;
  }

  getNewRecurringTransferNextDate(
    recurringTransfer: RecurringTransfer,
  ): string {
    let nextDate = DateTime.fromFormat(recurringTransfer.nextDate, DateFormat);

    switch (recurringTransfer.frequency) {
      case Frequency.Weekly:
        nextDate = nextDate.plus({
          months: 1,
        });
        break;

      case Frequency.Monthly:
        nextDate = nextDate.plus({
          weeks: 1,
        });
        break;

      default:
        // TODO: we shouldn't hit this case but maybe log here if we do
        break;
    }

    return nextDate.toFormat(DateFormat);
  }

  findOneRecurringTransfers(query: FindManyOptions<RecurringTransfer>) {
    return RecurringTransfer.findOne(query);
  }

  findRecurringTransfers(query: FindManyOptions<RecurringTransfer>) {
    return RecurringTransfer.find(query);
  }

  async findOne(query: FindManyOptions<Transfer>) {
    return Transfer.findOne(query);
  }
}
