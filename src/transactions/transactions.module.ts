import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { PerfectPaidTransaction } from './entities/well-paid-transaction.entity';
import { CategorizedTransaction } from './entities/categorized-transaction.entity';
import { TransactionSeries } from './entities/transaction-series.entity';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { ConsumerPreferenceSeries } from './entities/consumer-preference-series.entity';
import { ConsumerPreferenceTransaction } from './entities/consumer-preference-transaction.entity';
import { Category } from './entities/category.entity';
import { UsersModule } from '../users/users.module';
import { AstraModule } from 'src/astra/astra.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PerfectPaidTransaction,
      CategorizedTransaction,
      TransactionSeries,
      Category,
      ConsumerPreferenceSeries,
      ConsumerPreferenceTransaction,
      Category,
    ]),
    AuthModule,
    UsersModule,
    AstraModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
