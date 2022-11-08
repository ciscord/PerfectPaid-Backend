import { PerfectPaidBaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, Column, PrimaryColumn, ManyToOne } from 'typeorm';

@Entity()
export class AstraAccount extends PerfectPaidBaseEntity {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column({
    nullable: true,
  })
  officialName: string;

  @Column({
    nullable: true,
  })
  name: string;

  @Column({
    nullable: true,
  })
  nickname: string;

  @Column()
  mask: string;

  @Column({
    nullable: true,
  })
  institutionName: string;

  @Column({
    nullable: true,
  })
  institutionLogo: string;

  @Column()
  type: string;

  @Column()
  subtype: string;

  @Column({
    type: 'decimal',
    nullable: true,
  })
  currentBalance: number;

  @Column({
    type: 'decimal',
    nullable: true,
  })
  availableBalance: number;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  lastBalanceUpdateOn: string;

  @Column({
    nullable: true,
  })
  connectionStatus: string;

  @Column({
    type: Boolean,
    default: false,
  })
  isPrimary: boolean;
}
