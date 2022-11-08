import { Module } from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { TransfersController } from './transfers.controller';
import { AuthModule } from 'src/auth/auth.module';
import { ConnectionsModule } from 'src/connections/connections.module';
import { SqsModule } from '@ssut/nestjs-sqs';
import { Producer } from 'src/common/utils/sqs';

@Module({
  imports: [
    AuthModule,
    ConnectionsModule,
    SqsModule.register({
      producers: [Producer],
    }),
  ],
  controllers: [TransfersController],
  providers: [TransfersService],
  exports: [TransfersService],
})
export class TransfersModule {}
