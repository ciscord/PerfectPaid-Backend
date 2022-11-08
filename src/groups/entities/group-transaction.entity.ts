import { PerfectPaidBaseEntity } from 'src/common/entities/base.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CategorizedTransaction } from '../../transactions/entities/categorized-transaction.entity';
import { Group } from './group.entity';

@Entity()
export class GroupTransaction extends PerfectPaidBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Group)
  @JoinColumn()
  group: Group;

  @OneToOne(() => CategorizedTransaction)
  @JoinColumn()
  transaction: CategorizedTransaction;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  settledAt: string;
}
