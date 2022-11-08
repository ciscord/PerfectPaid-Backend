import { Module } from '@nestjs/common';
import { SqsModule } from '@ssut/nestjs-sqs';
import { SplitBillsModule } from 'src/split-bills/split-bills.module';
import { TransfersModule } from 'src/transfers/transfers.module';
import { Consumer, Producer } from 'src/common/utils/sqs';
import { WorkerService } from './worker.service';

@Module({
  imports: [
    SqsModule.register({
      consumers: [Consumer],
      producers: [Producer],
    }),
    SplitBillsModule,
    TransfersModule,
  ],
  providers: [WorkerService],
})
export class WorkerModule {}
