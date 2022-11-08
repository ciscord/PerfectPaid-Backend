import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PlaidTransaction } from './plaid-transaction.entity';
import { PlaidItem } from './plaid-item.entity';

@Entity()
export class PlaidAccount extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /* Entity Relations */
  @ManyToOne(() => PlaidItem, (plaidItem) => plaidItem.plaidAccounts)
  plaidItem: PlaidItem;

  @OneToMany(
    () => PlaidTransaction,
    (plaidTransaction) => plaidTransaction.plaidAccount,
  )
  plaidTransactions: PlaidTransaction[];

  // @ManyToOne(() => User, (user) => user.plaidAccounts)
  // user: User;
  /* Entity Relations */

  @Column({
    unique: true,
  })
  plaidAccountId: string;

  @Column()
  name: string;

  @Column()
  mask: string;

  @Column({
    nullable: true,
  })
  officialName: string;

  @Column({
    type: 'numeric',
    precision: 28,
    scale: 10,
    nullable: true,
  })
  currentBalance: string;

  @Column({
    type: 'numeric',
    precision: 28,
    scale: 10,
    nullable: true,
  })
  availableBalance: string;

  @Column({
    nullable: true,
  })
  isoCurrencyCode: string;

  @Column({
    nullable: true,
  })
  limit: string;

  @Column({
    nullable: true,
  })
  unofficialCurrencyCode: string;

  @Column()
  type: string;

  @Column()
  subtype: string;
}
