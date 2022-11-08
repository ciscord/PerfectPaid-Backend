import { Module } from '@nestjs/common';
import { SplitBillsService } from './split-bills.service';
import { SplitBillsController } from './split-bills.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SplitBill } from './entities/split-bill.entity';
import { AuthModule } from 'src/auth/auth.module';
import { ConnectionsModule } from 'src/connections/connections.module';
import { SqsModule } from '@ssut/nestjs-sqs';
import { Producer } from 'src/common/utils/sqs';

@Module({
  imports: [
    TypeOrmModule.forFeature([SplitBill]),
    SqsModule.register({
      producers: [Producer],
    }),
    AuthModule,
    ConnectionsModule,
  ],
  controllers: [SplitBillsController],
  providers: [SplitBillsService],
  exports: [SplitBillsService],
})
export class SplitBillsModule {}
