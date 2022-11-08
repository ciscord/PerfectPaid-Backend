import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToOne,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { PlaidTransaction } from '../../plaid/entities/plaid-transaction.entity';

@Entity()
export class PerfectPaidTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  pendingTransactionId: string;

  @Column()
  isPending: boolean;

  @OneToOne(() => PlaidTransaction)
  @JoinColumn()
  plaidTransaction: PlaidTransaction;

  @Column({
    nullable: true,
  })
  authorizeDate: string;

  @Column({
    nullable: true,
  })
  date: string;

  // TODO: Model not created yet
  // @Column()
  // accountId: string

  // TODO: Model not created yet
  // @Column()
  // userId: string

  // TODO: Model not created yet
  // @Column()
  // plaidAccountId: string

  @Column()
  transferType: string;

  @Column()
  transferFree: number;

  @Column()
  frequency: string;

  @Column()
  transferCadence: string;

  @Column()
  paymentReference: string;

  @Column()
  amount: number;

  @Column()
  fundingCurrency: string;

  @Column()
  isoCurrencyCode: string;

  @Column()
  exchangeRate: string;

  @Column()
  accountName: string;

  @Column({
    nullable: true,
  })
  officialName: string;

  @Column()
  accountType: string;

  @Column({
    nullable: true,
  })
  accountSubtype: string;

  @Column({
    nullable: true,
  })
  transactionPostalCode: string;

  @Column({
    nullable: true,
  })
  achPpdId: string;

  @Column()
  payee: string;

  @Column()
  requestId: string;

  @Column({
    nullable: true,
  })
  reason: string;

  @Column()
  transactionDescription: string;

  @Column({
    nullable: true,
  })
  merchantName: string;

  @Column()
  transactionErrorType: string;

  @Column()
  transactionErrorCode: string;

  @Column()
  transaction: string;

  @Column({
    nullable: true,
  })
  transactionDisplayMessage: string;

  @Column()
  transactionRequestId: string;

  @Column()
  transactionCauses: string;

  @Column()
  transactionStatus: string;

  @Column()
  categoryId: string;

  @Column()
  transactionSubcategory: string;

  @Column({
    nullable: true,
  })
  subcatCode: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;
}
