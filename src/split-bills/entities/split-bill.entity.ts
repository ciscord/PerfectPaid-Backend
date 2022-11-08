import { AstraAccount } from 'src/astra/entities/astra-account.entity';
import { PerfectPaidBaseEntity } from 'src/common/entities/base.entity';
import { Connection } from 'src/connections/entities/connection.entity';
import { TransactionSeries } from 'src/transactions/entities/transaction-series.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';

export enum TransferTiming {
  OneTime = 'one_time',
  AfterBillPaid = 'after_bill_paid',
  FixedDate = 'fixed_date',
}

export enum SplitMethod {
  Even = 'even',
  Percentage = 'percentage',
  Fixed = 'fixed',
}

export enum RepeatUntil {
  ManuallyStopped = 'manually_stopped',
  NumberOfTransfers = 'number_of_transfers',
}

@Entity()
export class SplitBill extends PerfectPaidBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => AstraAccount)
  userAstraAccount: AstraAccount;

  @RelationId((splitBill: SplitBill) => splitBill.userAstraAccount)
  userAstraAccountId: string;

  @ManyToOne(() => User)
  userToSplitWith: User;

  @ManyToOne(() => AstraAccount)
  userToSplitWithAstraAccount: AstraAccount;

  @RelationId((splitBill: SplitBill) => splitBill.userToSplitWithAstraAccount)
  userToSplitWithAstraAccountId: string;

  @ManyToOne(() => Connection)
  connection: Connection;

  @ManyToOne(() => TransactionSeries)
  transactionSeries: TransactionSeries;

  @Column({
    type: 'enum',
    enum: TransferTiming,
    default: TransferTiming.AfterBillPaid,
  })
  transferTiming: TransferTiming;

  @Column({
    type: 'date',
    nullable: true,
  })
  dueDate: string;

  @Column({
    type: 'enum',
    enum: SplitMethod,
    default: SplitMethod.Even,
  })
  splitMethod: SplitMethod;

  @Column({
    default: 0,
  })
  amount: number;

  @Column({
    default: false,
  })
  accepted: boolean;

  @Column({
    default: false,
  })
  tip: boolean;

  // Stored in cents
  @Column({
    default: 250,
  })
  tipAmount: number;

  @Column({
    type: 'enum',
    enum: RepeatUntil,
    default: RepeatUntil.ManuallyStopped,
  })
  repeatUntil: RepeatUntil;

  @Column({
    default: 0,
  })
  repeatUntilNumber: number;
}
