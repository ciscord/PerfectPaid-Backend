import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TransactionSeries } from './transaction-series.entity';
import { Merchant } from './merchant.entity';
import { User } from 'src/users/entities/user.entity';
import { Category } from './category.entity';
import { AstraAccount } from '../../astra/entities/astra-account.entity';

@Entity()
export class CategorizedTransaction extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  plaidTransactionId: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => AstraAccount)
  @JoinColumn()
  account: AstraAccount;

  @ManyToOne(() => Merchant)
  @JoinColumn()
  merchant: Merchant;

  @ManyToOne(() => TransactionSeries)
  @JoinColumn()
  transactionSeries: TransactionSeries;

  @ManyToOne(() => Category, (category) => category.categorizedTransactions)
  @JoinColumn()
  category: Category;

  @Column({ type: 'date' })
  createDate: string;

  @Column()
  xferType: string;

  @Column()
  txCity: string;

  @Column()
  txRegion: string;

  @Column()
  txPostalCode: string;

  @Column({ nullable: true, type: 'decimal' })
  txLat: number;

  @Column({ nullable: true, type: 'decimal' })
  txLon: number;

  @Column({ nullable: true })
  geohash: string;

  @Column()
  isWp: boolean;

  @Column()
  isPending: boolean;

  @Column()
  isSelfSend: boolean;

  @Column()
  transactionDescription: string;

  @Column()
  payee: string;

  @Column()
  paymentMethod: string;

  @Column()
  reason: string;

  @Column()
  isoCurrencyCode: string;

  @Column({
    type: 'numeric',
    precision: 28,
    scale: 10,
    nullable: true,
  })
  amount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
