import { Transform } from 'class-transformer';
import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { TransactionSeries } from './transaction-series.entity';

@Entity()
@Unique(['transactionSeries', 'date'])
export class PredictedTransaction extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ManyToOne(() => TransactionSeries)
  @JoinColumn()
  transactionSeries: TransactionSeries;

  @Column({ type: 'date' })
  date: Date;

  @Column()
  @Transform(({ value }) => Math.abs(value))
  amount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
