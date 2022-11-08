import { Module } from '@nestjs/common';
import { SqsModule } from '@ssut/nestjs-sqs';
import { Producer } from 'src/common/utils/sqs';
import { SplitBillsModule } from 'src/split-bills/split-bills.module';
import { TransfersModule } from 'src/transfers/transfers.module';
import { UsersModule } from 'src/users/users.module';
import { CronService } from './cron.service';

@Module({
  imports: [UsersModule, SplitBillsModule, TransfersModule],
  providers: [CronService],
})
export class CronModule {}
