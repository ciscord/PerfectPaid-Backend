import { forwardRef, Module } from '@nestjs/common';
import { AstraService } from './astra.service';
import { AstraController } from './astra.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AstraAccount } from './entities/astra-account.entity';
import { AstraTransaction } from './entities/astra-transaction.entity';
import { AuthModule } from 'src/auth/auth.module';
import { RoutinesService } from './routines.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AstraAccount, AstraTransaction]),
    forwardRef(() => AuthModule),
  ],
  controllers: [AstraController],
  providers: [AstraService, RoutinesService],
  exports: [AstraService],
})
export class AstraModule {}
