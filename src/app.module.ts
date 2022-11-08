import { Module, HttpModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwilioModule } from 'nestjs-twilio';
import { SendGridModule } from '@anchan828/nest-sendgrid';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from 'nestjs-pino';
import * as ormconfig from './ormconfig';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlaidModule } from './plaid/plaid.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TransactionsModule } from './transactions/transactions.module';
import { AstraModule } from './astra/astra.module';
import { CronModule } from './cron/cron.module';
import { ConnectionsModule } from './connections/connections.module';
import { SplitBillsModule } from './split-bills/split-bills.module';
import { TransfersModule } from './transfers/transfers.module';
import { WorkerModule } from './worker/worker.module';
import { AlertsModule } from './alerts/alerts.module';
import { GroupsModule } from './groups/groups.module';
import { BudgetModule } from './budget/budget.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(
      Object.assign(ormconfig, {
        autoLoadEntities: true,
      }),
    ),
    TwilioModule.forRoot({
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
    }),
    SendGridModule.forRoot({
      apikey: process.env.SENDGRID_API_KEY,
    }),
    LoggerModule.forRoot({
      pinoHttp:
        process.env.NODE_ENV === 'local'
          ? {
              prettyPrint: {
                colorize: true,
                levelFirst: true,
                translateTime: 'UTC:mm/dd/yyyy, h:MM:ss TT Z',
              },
            }
          : {},
    }),
    ScheduleModule.forRoot(),
    HttpModule,
    /* PerfectPaid Modules Start */
    PlaidModule,
    AuthModule,
    UsersModule,
    TransactionsModule,
    AstraModule,
    CronModule,
    ConnectionsModule,
    SplitBillsModule,
    TransfersModule,
    WorkerModule,
    AlertsModule,
    GroupsModule,
    BudgetModule,
    /* PerfectPaid Modules End */
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
