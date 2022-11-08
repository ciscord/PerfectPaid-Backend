import { PerfectPaidBaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

export enum Status {
  Pending = 'pending',
  Accepted = 'accepted',
  Blocked = 'blocked',
}

@Entity()
@Unique(['userOneId', 'userTwoId'])
@Unique(['senderUser', 'receiver'])
// Check constraint does not convert to snake case
@Check(
  `"user_one_id" < "user_two_id" OR ("user_one_id" is null and "user_two_id" is null)`,
)
export class Connection extends PerfectPaidBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: true,
  })
  userOneId: number;

  @Column({
    nullable: true,
  })
  userTwoId: number;

  @ManyToOne(() => User)
  @JoinColumn({ referencedColumnName: 'internalId' })
  senderUser: User;

  @ManyToOne(() => User)
  @JoinColumn({ referencedColumnName: 'internalId' })
  invitedUser: User;

  @Column({
    nullable: true,
  })
  preferredName: string;

  @Column({
    nullable: true,
  })
  receiver: string; // phone or email

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.Pending,
  })
  status: Status;
}
