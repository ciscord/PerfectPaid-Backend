import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { CategorizedTransaction } from './categorized-transaction.entity';
import { PredictedTransaction } from './predicted-transaction.entity';
import { Merchant } from './merchant.entity';
import { SplitBill } from 'src/split-bills/entities/split-bill.entity';
import { PerfectPaidBaseEntity } from 'src/common/entities/base.entity';
import { ConsumerPreferenceSeries } from './consumer-preference-series.entity';
import { Category } from './category.entity';

@Entity()
export class TransactionSeries extends PerfectPaidBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /* Entity Relations */
  @ManyToOne(() => Merchant, { nullable: true })
  @JoinColumn()
  merchant: Merchant;

  @ManyToOne(() => User)
  user: User;

  @OneToMany(
    () => CategorizedTransaction,
    (categorizedTrans) => categorizedTrans.transactionSeries,
  )
  categorizedTransactions: CategorizedTransaction[];

  @OneToMany(
    () => PredictedTransaction,
    (predictedTran) => predictedTran.transactionSeries,
  )
  predictedTransactions: PredictedTransaction[];

  @OneToMany(() => SplitBill, (splitBill) => splitBill.transactionSeries)
  splitBills: SplitBill[];

  @OneToOne(() => ConsumerPreferenceSeries)
  @JoinColumn()
  consumerPreferenceSeries: ConsumerPreferenceSeries;

  @ManyToOne(() => Category, (category) => category.categorizedTransactions)
  @JoinColumn()
  category: Category;

  @Column()
  seriesName: string;

  @Column()
  isIncome: boolean;

  @Column()
  isRecurring: boolean;

  @Column('decimal')
  recurringScore: number;

  @Column()
  recurringConfidence: string;

  @Column()
  isSplit: boolean;

  @Column({ nullable: true })
  frequency: string;

  @Column({ type: 'date', nullable: true })
  lastTransactionDate: string;
}
