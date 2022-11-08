import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PlaidAccount } from './plaid-account.entity';
import { PaymentMeta } from '../interfaces/payment-meta.interface';
import { Location } from '../interfaces/location.interface';

@Entity()
export class PlaidTransaction extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /* Entity Relations */
  @ManyToOne(
    () => PlaidAccount,
    (plaidAccount) => plaidAccount.plaidTransactions,
  )
  plaidAccount: PlaidAccount;

  // @ManyToOne(() => User, (user) => user.plaidTransactions)
  // user: User;
  /* Entity Relations */

  @Column({
    unique: true,
  })
  plaidTransactionId: string;

  @Column({
    nullable: true,
  })
  accountOwner: string;

  @Column({
    nullable: true,
  })
  pendingTransactionId: string;

  @Column()
  pending: boolean;

  @Column()
  paymentChannel: string;

  @Column({
    type: 'jsonb',
  })
  paymentMeta: PaymentMeta;

  @Column()
  name: string;

  @Column({
    nullable: true,
  })
  merchantName: string;

  @Column({
    type: 'jsonb',
  })
  location: Location;

  @Column({
    nullable: true,
    type: 'date',
  })
  authorizedDate: string;

  // Only for UK institutions
  // @Column({
  //   nullable: true,
  // })
  // authorizedDatetime: string;

  // For pending transactions, the date that the transaction occurred
  // For posted transactions, the date that the transaction posted.
  @Column({
    type: 'date',
  })
  date: string;

  // Only for UK institutions
  // @Column()
  // datetime: string;

  @Column({
    nullable: true,
  })
  plaidCategoryId: string;

  @Column({
    nullable: true,
  })
  category: string;

  @Column({
    nullable: true,
  })
  subcategory: string;

  @Column({
    nullable: true,
  })
  unofficialCurrencyCode: string;

  @Column({
    nullable: true,
  })
  isoCurrencyCode: string;

  @Column({
    type: 'numeric',
    precision: 28,
    scale: 10,
  })
  amount: number;

  @Column()
  type: string;

  @Column({
    nullable: true,
  })
  transactionCode: string;
}
