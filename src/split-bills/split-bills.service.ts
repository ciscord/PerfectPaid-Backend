import { Injectable } from '@nestjs/common';
import { Connection } from 'src/connections/entities/connection.entity';
import { TransactionSeries } from 'src/transactions/entities/transaction-series.entity';
import { User } from 'src/users/entities/user.entity';
import { FindConditions, FindManyOptions, Not } from 'typeorm';
import { CreateSplitBillDto } from './dto/create-split-bill.dto';
import { FindSplitBillsQuery } from './dto/find-split-bills-query.dto';
import {
  SplitBillTransaction,
  Status,
} from './entities/split-bill-transaction.entity';
import { SplitBill } from './entities/split-bill.entity';
import { Status as ConnectionStatus } from '../connections/entities/connection.entity';
import { AstraClient } from 'src/astra/astra-api-client';
import { Type } from 'src/astra/interfaces/astra-routine.interface';
import { DateTime } from 'luxon';
import { CategorizedTransaction } from 'src/transactions/entities/categorized-transaction.entity';
import { ConnectionsService } from 'src/connections/connections.service';
import { AstraAccount } from 'src/astra/entities/astra-account.entity';
import { AstraAccountSubtype } from 'src/common/utils/astra';
import { SqsService } from '@ssut/nestjs-sqs';
import {
  SQSMessageSplitBill,
  Type as SQSMessageType,
} from 'src/worker/interfaces/sqs-message.interface';
import { v4 as uuidv4 } from 'uuid';
import { Producer } from 'src/common/utils/sqs';
import { DateFormat } from 'src/common/utils/date';
import { SplitBillsQueryTypes } from 'src/common/utils/split-bills';

@Injectable()
export class SplitBillsService {
  constructor(
    private connectionsSerivce: ConnectionsService,
    private sqsService: SqsService,
  ) {}

  async createSplitBillTransaction(
    splitBill: SplitBill,
    date: DateTime,
    categorizedTransactionId?: string,
  ) {
    const {
      user,
      userAstraAccountId,
      userToSplitWith,
      userToSplitWithAstraAccountId,
      connection,
    } = splitBill;
    let status: Status;
    let astraRoutineId: string;

    if (!connection || connection.status === ConnectionStatus.Pending) {
      status = Status.PendingConnection;
    } else {
      const astraClient = new AstraClient(user.accessToken);
      // TODO: figure out a scheme for the name, maybe the type of split bill happening?
      const routine = await astraClient.createRoutine({
        type: Type.OneTime,
        name: 'TODO',
        active: true,
        source_id: userAstraAccountId,
        destination_id: userToSplitWithAstraAccountId,
        destination_user_id: userToSplitWith.astraUserId,
        amount: splitBill.amount,
        start_date: date.toFormat(DateFormat),
      });

      status = Status.Processing;
      astraRoutineId = routine.id;
    }

    const splitBillTransaction = new SplitBillTransaction();
    splitBillTransaction.splitBill = splitBill;
    splitBillTransaction.status = status;

    if (astraRoutineId) {
      splitBillTransaction.astraRoutineId = astraRoutineId;
    }

    if (categorizedTransactionId) {
      splitBillTransaction.categorizedTransaction =
        await CategorizedTransaction.findOne(categorizedTransactionId);
    }

    await splitBillTransaction.save();

    return splitBillTransaction;
  }

  // TODO: Validate all splitPercentage add are <= 100
  // TODO: Validate all splitAmount are <= transaction amount
  // TODO: Validate dueDate is in the future
  // TODO: Wrap all entity creation in a transaction
  // https://docs.nestjs.com/techniques/database#transactions
  async create(user: User, createSplitBillDto: CreateSplitBillDto) {
    for (const splitBill of createSplitBillDto.splitBills) {
      const {
        transactionSeriesId,
        categorizedTransactionId,
        accountId,
        connections,
        transferTiming,
        dueDate,
        splitMethod,
        repeatUntil,
        repeatUntilNumber,
      } = splitBill;

      const astraAccount = await AstraAccount.findOneOrFail({
        id: accountId,
        subtype: AstraAccountSubtype.Checking,
      });
      const transactionSeries = await TransactionSeries.findOneOrFail({
        id: transactionSeriesId,
        user,
      });

      for (const { id, amount } of connections) {
        const connection =
          await this.connectionsSerivce.findOneAcceptedOrPendingConnectionWithUser(
            id,
            user,
          );

        const newSplitBill = new SplitBill();

        newSplitBill.user = user;
        newSplitBill.userAstraAccount = astraAccount;
        newSplitBill.connection = connection;
        newSplitBill.transactionSeries = transactionSeries;
        newSplitBill.transferTiming = transferTiming;
        newSplitBill.splitMethod = splitMethod;
        newSplitBill.amount = amount;
        newSplitBill.repeatUntil = repeatUntil || null;

        // If the connection has the user then attach it to the splitBill
        if (connection.invitedUser && connection.invitedUser.id !== user.id) {
          newSplitBill.userToSplitWith = connection.invitedUser;
        } else if (
          connection.senderUser &&
          connection.senderUser.id !== user.id
        ) {
          newSplitBill.userToSplitWith = connection.senderUser;
        }

        if (dueDate) {
          newSplitBill.dueDate = dueDate;
        }

        if (repeatUntilNumber) {
          newSplitBill.repeatUntilNumber = repeatUntilNumber;
        }

        if (connection.senderUser && connection.invitedUser) {
          const userToSplitWith =
            user.id !== connection.senderUser.id
              ? connection.senderUser
              : connection.invitedUser;
          newSplitBill.userToSplitWith = userToSplitWith;
        }

        await newSplitBill.save();

        if (connection.status === ConnectionStatus.Accepted) {
          await this.sendCreateSplitBillTransactionSQSMessage(
            transactionSeriesId,
            categorizedTransactionId,
          );
        }
      }
    }
  }

  async sendCreateSplitBillTransactionSQSMessage(
    transactionSeriesId: string,
    categorizedTransactionId: string,
  ) {
    const body: SQSMessageSplitBill = {
      type: SQSMessageType.SplitBill,
      transactionSeriesId,
      categorizedTransactionId,
    };
    const message = {
      id: uuidv4(),
      body,
      delaySeconds: 0,
    };

    await this.sqsService.send(Producer.name, message);
  }

  async findSplitBillsToAccept(user: User, query: FindSplitBillsQuery) {
    const { connectionId, type, ...remainingQuery } = query;
    const findConditions: FindConditions<SplitBill> = {
      ...remainingQuery,
    };

    if (connectionId) {
      const connection = await Connection.findOneOrFail({
        where: [
          { id: query.connectionId, userOneId: user.internalId },
          { id: query.connectionId, userTwoId: user.internalId },
        ],
      });
      findConditions.connection = connection;
    }

    // if the type is received then the userToSplitWith will be the
    // current user
    if (type) {
      if (type === SplitBillsQueryTypes.Received) {
        findConditions.userToSplitWith = user;
      } else {
        findConditions.user = user;
      }

      return SplitBill.find(findConditions);
    }

    return SplitBill.find({
      where: [
        {
          user,
          ...findConditions,
        },
        {
          userToSplitWith: user,
          ...findConditions,
        },
      ],
    });
  }

  async acceptBill(user: User, splitBillId: number) {
    const splitBill = await SplitBill.findOneOrFail({
      id: splitBillId,
      userToSplitWith: user,
      accepted: false,
    });

    splitBill.accepted = true;
    return splitBill.save();
  }

  find(query: FindManyOptions<SplitBill>) {
    return SplitBill.find(query);
  }

  findOne(query: FindManyOptions<SplitBill>) {
    return SplitBill.findOne(query);
  }
}
