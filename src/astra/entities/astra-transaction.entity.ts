import { Entity, Column, PrimaryColumn, ManyToOne } from 'typeorm';
import { PerfectPaidBaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/users/entities/user.entity';
import { AstraAccount } from './astra-account.entity';

@Entity()
export class AstraTransaction extends PerfectPaidBaseEntity {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => AstraAccount)
  account: AstraAccount;

  @Column()
  name: string;

  @Column({
    nullable: true,
  })
  merchantName: string;

  @Column('decimal', { nullable: true })
  amount: number;

  @Column({
    type: 'date',
  })
  date: string; // year-month-day (yyyy-LL-dd)

  @Column()
  category: string;

  @Column()
  categoryId: string;

  @Column({
    nullable: true,
  })
  locationAddress: string;

  @Column({
    nullable: true,
  })
  locationCity: string;

  @Column({
    nullable: true,
  })
  locationState: string;

  @Column({
    nullable: true,
  })
  locationStoreNumber: string;

  @Column({
    nullable: true,
  })
  locationZip: string;

  @Column({
    type: Boolean,
  })
  pending: boolean;
}
