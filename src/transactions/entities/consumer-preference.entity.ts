import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TransactionSeries } from './transaction-series.entity';
import { User } from 'src/users/entities/user.entity';
import { CategorizedTransaction } from './categorized-transaction.entity';

@Entity()
export class ConsumerPreference extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => TransactionSeries)
  @JoinColumn()
  transactionSeries: TransactionSeries;

  @ManyToOne(() => CategorizedTransaction)
  @JoinColumn()
  categorizedTransaction: CategorizedTransaction;

  @Column({
    nullable: true,
  })
  seriesMerchantNickname: string;

  @Column({
    nullable: true,
  })
  categoryId: string;

  @Column({
    nullable: true,
  })
  isRecurringUser: boolean;

  @Column({
    nullable: true,
  })
  isSavingsUser: boolean;

  @Column({
    nullable: true,
  })
  isIncomeUser: boolean;

  @Column({
    type: 'numeric',
    precision: 28,
    scale: 10,
    nullable: true,
  })
  seriesAmountUser: number;

  @Column({
    nullable: true,
  })
  seriesFrequencyUser: string;

  @Column({ type: 'date' })
  nextDateUser: string;

  @Column({
    nullable: true,
  })
  primaryAccountId: string;

  @Column({
    nullable: true,
  })
  primaryAccountIdUser: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
