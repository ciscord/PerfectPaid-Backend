import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DateTime } from 'luxon';
import { TransferTiming } from 'src/split-bills/entities/split-bill.entity';
import { SplitBillsService } from 'src/split-bills/split-bills.service';
import { IsNull, Not } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { DateFormat } from '../common/utils/date';
import { TransfersService } from 'src/transfers/transfers.service';
import { Status } from 'src/transfers/entities/recurring-transfer.entity';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private usersService: UsersService,
    private splitBillsService: SplitBillsService,
    private transfersService: TransfersService,
  ) {}

  @Cron('0 */30 * * * *')
  async refreshAstraAccessToken() {
    this.logger.log(`running ${this.refreshAstraAccessToken.name} cron`);

    const users = await User.find({
      // TODO: fix in future PR
      where: {
        // refreshDate: LessThanOrEqual(new Date()),
        refreshToken: Not(IsNull()),
        astraRedirectUri: Not(IsNull()),
      },
    });
    for (const user of users) {
      try {
        await this.usersService.refreshAstraToken(user);
      } catch (e) {
        this.logger.log(e);
      }
    }
  }

  @Cron('*/10 * * * * *')
  async processFixedDateSplitBillsTransactions() {
    this.logger.log(
      `running ${this.processFixedDateSplitBillsTransactions.name} cron`,
    );
    const date = DateTime.now();

    // TODO: refactor to use take and skip so we don't grab all the records at once.
    const splitBills = await this.splitBillsService.find({
      where: {
        transferTiming: TransferTiming.FixedDate,
        accepted: true,
        dueDate: date.toFormat(DateFormat),
      },
      relations: ['user', 'userToSplitWith', 'connection'],
    });

    for (const splitBill of splitBills) {
      await this.splitBillsService.createSplitBillTransaction(splitBill, date);
      splitBill.dueDate = date
        .plus({
          months: 1,
        })
        .toFormat(DateFormat);
      await splitBill.save();
    }
  }

  @Cron('*/10 * * * * *')
  async processRecurringTransfers() {
    const nextDate = DateTime.now().toFormat(DateFormat);

    // TODO: refactor to use take and skip so we don't grab all the records at once.
    const recurringTransfers =
      await this.transfersService.findRecurringTransfers({
        where: {
          nextDate,
          status: Status.Active,
        },
      });
    const recurringTransferIds = recurringTransfers.map((o) => o.id);

    if (recurringTransferIds.length > 0) {
      await this.transfersService.sendCreateTransferSQSMessage(
        recurringTransferIds,
      );
    }
  }
}
