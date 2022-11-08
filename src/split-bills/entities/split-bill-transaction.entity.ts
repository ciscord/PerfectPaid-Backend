import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PerfectPaidBaseEntity } from 'src/common/entities/base.entity';
import { SplitBill } from './split-bill.entity';
import { CategorizedTransaction } from 'src/transactions/entities/categorized-transaction.entity';

export enum Status {
  Complete = 'complete',
  Processing = 'processing',
  Failed = 'failed',
  PendingConnection = 'pending_connection',
}

@Entity()
export class SplitBillTransaction extends PerfectPaidBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SplitBill)
  splitBill: SplitBill;

  @ManyToOne(() => CategorizedTransaction)
  categorizedTransaction: CategorizedTransaction;

  @Column({
    unique: true,
    nullable: true,
  })
  astraRoutineId: string;

  @Column({
    type: 'enum',
    enum: Status,
  })
  status: Status;
}
