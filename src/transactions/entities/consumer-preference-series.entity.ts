import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { TransactionSeries } from './transaction-series.entity';
import { Category } from './category.entity';

@Entity()
export class ConsumerPreferenceSeries extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ManyToOne(() => User)
  user: User;

  @OneToOne(() => TransactionSeries)
  series: TransactionSeries;

  @ManyToOne(() => Category)
  category: Category;

  @Column({ nullable: true })
  seriesNickname: string;

  @Column({ nullable: true })
  isRecurring: boolean;

  @Column({ nullable: true })
  isSavings: boolean;

  @Column({ nullable: true })
  isIncome: boolean;

  @Column({ nullable: true })
  amount: number;

  @Column({ nullable: true })
  frequency: string;

  @Column({ nullable: true, type: 'date' })
  nextDate: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
