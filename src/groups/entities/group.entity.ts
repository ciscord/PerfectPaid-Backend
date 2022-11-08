import { PerfectPaidBaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { GroupCategory } from './group-category.entity';
import { GroupTransaction } from './group-transaction.entity';

export enum GroupPermission {
  Owner = 'owner',
  Everyone = 'everyone',
}

export enum DeletePolicy {
  Manual = 'manual',
  SingleBill = 'single_bill',
}

@Entity()
export class Group extends PerfectPaidBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => User)
  owner: User;

  @ManyToOne(() => GroupCategory)
  category: GroupCategory;

  @ManyToMany(() => User)
  @JoinTable()
  members: User[];

  @OneToMany(
    () => GroupTransaction,
    (transaction: GroupTransaction) => transaction.group,
  )
  transactions: GroupTransaction[];

  @Column({
    type: 'enum',
    enum: GroupPermission,
    default: GroupPermission.Owner,
  })
  editors: GroupPermission;

  @Column({
    type: 'enum',
    enum: GroupPermission,
    default: GroupPermission.Owner,
  })
  requesters: GroupPermission;

  @Column({
    type: 'enum',
    enum: DeletePolicy,
    default: DeletePolicy.Manual,
  })
  deletePolicy: DeletePolicy;
}
