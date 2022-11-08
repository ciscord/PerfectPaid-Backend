import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { SplitBillsModule } from 'src/split-bills/split-bills.module';
import { TransfersModule } from 'src/transfers/transfers.module';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';

@Module({
  imports: [SplitBillsModule, TransfersModule, AuthModule],
  controllers: [AlertsController],
  providers: [AlertsService],
})
export class AlertsModule {}
