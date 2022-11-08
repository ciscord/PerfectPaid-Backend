import { AstraAccount } from 'src/astra/entities/astra-account.entity';
import { PerfectPaidBaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum Status {
  Active = 'active',
  Done = 'done',
  Cancelled = 'cancelled',
}

export enum Type {
  Send = 'send',
  Request = 'request',
}

export enum Frequency {
  OneTime = 'one_time',
  Weekly = 'weekly',
  Monthly = 'monthly',
}

export enum RepeatUntil {
  ManuallyStopped = 'manually_stopped',
  // On the frontend it's going to be a dropdown, this will make it easier
  NumberOfTransfers = 'number_of_transfers',
}

@Entity()
export class RecurringTransfer extends PerfectPaidBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  from: User;

  @ManyToOne(() => User)
  to: User;

  @ManyToOne(() => AstraAccount)
  astraAccount: AstraAccount;

  @Column({
    type: 'enum',
    enum: Type,
  })
  type: Type;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.Active,
  })
  status: Status;

  @Column()
  description: string;

  @Column({
    type: 'numeric',
    precision: 28,
    scale: 10,
  })
  amount: number;

  @Column({
    type: 'date',
    nullable: true,
  })
  nextDate: string;

  @Column({
    type: 'enum',
    enum: Frequency,
  })
  frequency: Frequency;

  @Column({
    type: 'enum',
    enum: RepeatUntil,
    default: RepeatUntil.ManuallyStopped,
  })
  repeatUntil: RepeatUntil;

  @Column({
    default: 0,
  })
  repeatUntilNumber: number;
}
