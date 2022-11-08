import { PerfectPaidBaseEntity } from 'src/common/entities/base.entity';
import { SplitBill } from 'src/split-bills/entities/split-bill.entity';
import { Transfer } from 'src/transfers/entities/transfer.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum Type {
  PaidTooMuch = 'paid_too_much',
  Owe = 'owe',
  BillSplitReject = 'bill_split_reject',
  BillSplitRequest = 'bill_split_request',
  TransferRequest = 'transfer_request',
  TransferReject = 'transfer_reject',
}

@Entity()
export class Alert extends PerfectPaidBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: Type,
  })
  type: Type;

  @Column()
  resourceId: string;

  // Dynamically set based on type and resourceId
  splitBill: SplitBill;
  transfer: Transfer;
}
