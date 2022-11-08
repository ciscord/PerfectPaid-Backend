import {
  BaseEntity,
  Entity,
  Column,
  PrimaryColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CategorizedTransaction } from './categorized-transaction.entity';

@Entity()
export class Category extends BaseEntity {
  @PrimaryColumn()
  id: string;

  // Relations
  @OneToMany(
    () => CategorizedTransaction,
    (categorizedTrans) => categorizedTrans.category,
  )
  categorizedTransactions: CategorizedTransaction[];

  @Column()
  subCat_1: string;

  @Column()
  subCat_2: string;

  @Column()
  subCat_3: string;

  @Column()
  subCat_4: string;

  @Column()
  recurringGroup: string;

  @Column()
  budgetGroup: string;

  @Column('decimal', { nullable: true })
  weight: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
