import { Module } from '@nestjs/common';
import { BudgetController } from './budget.controller';
import { BudgetService } from './budget.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategorizedTransaction } from '../transactions/entities/categorized-transaction.entity';
import { TransactionSeries } from '../transactions/entities/transaction-series.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CategorizedTransaction, TransactionSeries]),
    AuthModule,
  ],
  controllers: [BudgetController],
  providers: [BudgetService],
})
export class BudgetModule {}
