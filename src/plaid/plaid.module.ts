import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaidItem } from './entities/plaid-item.entity';
import { PlaidAccount } from './entities/plaid-account.entity';
import { PlaidTransaction } from './entities/plaid-transaction.entity';
import { PlaidController } from './plaid.controller';
import { PlaidService } from './plaid.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlaidItem, PlaidAccount, PlaidTransaction]),
    AuthModule,
  ],
  controllers: [PlaidController],
  providers: [PlaidService],
})
export class PlaidModule {}
