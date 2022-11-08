import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PlaidAccount } from './plaid-account.entity';

@Entity()
export class PlaidItem extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  // @ManyToOne(() => User, (user) => user.plaidItems)
  // user: User;

  @OneToMany(() => PlaidAccount, (plaidAccount) => plaidAccount.plaidItem)
  plaidAccounts: PlaidAccount[];

  @Column({
    unique: true,
  })
  plaidAccessToken: string;

  @Column({
    unique: true,
  })
  plaidItemId: string;

  @Column()
  plaidInstitutionId: string;

  @Column()
  status: string;
}
