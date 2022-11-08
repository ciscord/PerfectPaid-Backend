import { AstraAccount } from 'src/astra/entities/astra-account.entity';
import { PerfectPaidBaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RecurringTransfer } from './recurring-transfer.entity';

export enum Type {
  Send = 'send',
  Request = 'request',
}

@Entity()
export class Transfer extends PerfectPaidBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  from: User;

  @ManyToOne(() => User)
  to: User;

  @ManyToOne(() => AstraAccount)
  astraAccount: AstraAccount;

  @ManyToOne(() => RecurringTransfer)
  recurringTransfer: RecurringTransfer;

  @Column({
    type: 'enum',
    enum: Type,
  })
  type: Type;

  @Column()
  description: string;

  @Column({
    type: 'numeric',
    precision: 28,
    scale: 10,
  })
  amount: number;

  @Column({
    unique: true,
  })
  astraRoutineId: string;
}
