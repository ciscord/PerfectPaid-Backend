import {
  Entity,
  Column,
  PrimaryColumn,
  Generated,
  OneToOne,
  JoinColumn,
  RelationId,
} from 'typeorm';
import { PerfectPaidBaseEntity } from 'src/common/entities/base.entity';
import { Exclude, Expose } from 'class-transformer';
import { AstraAccount } from 'src/astra/entities/astra-account.entity';

export enum Status {
  Connected = 'connected',
  Pending = 'pending',
  AstraSetupIncomplete = 'astra_setup_incomplete',
}

@Entity()
export class User extends PerfectPaidBaseEntity {
  @PrimaryColumn()
  id: string;

  @Column({ unique: true })
  @Generated('increment')
  internalId: number;

  // Relations
  @OneToOne(() => AstraAccount)
  @JoinColumn()
  primaryAccount: AstraAccount;

  // Returns the id of the relation
  @RelationId((user: User) => user.primaryAccount)
  primaryAcccountId: string;

  @Column({
    unique: true,
  })
  username: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column()
  phone: string;

  @Column({
    nullable: true,
  })
  preferredName: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    nullable: true,
  })
  middleName: string;

  @Column({
    nullable: true,
  })
  picture: string;

  @Column()
  address1: string;

  @Column({
    nullable: true,
  })
  address2: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  postalCode: string;

  @Column()
  dob: string;

  @Column()
  ssn: string;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.AstraSetupIncomplete,
  })
  status: string;

  @Column({
    unique: true,
    nullable: true,
  })
  @Exclude()
  astraUserIntentId: string;

  @Column({
    unique: true,
    nullable: true,
  })
  @Exclude()
  astraUserId: string;

  @Column({
    nullable: true,
  })
  @Exclude()
  astraRedirectUri: string;

  @Column({
    // select: false,
    nullable: true,
  })
  @Exclude()
  accessToken: string;

  @Column({
    nullable: true,
  })
  @Exclude()
  refreshToken: string;

  @Column({
    nullable: true,
    type: 'date',
  })
  @Exclude()
  refreshDate: Date;

  @Column({
    nullable: true,
  })
  monthlyIncome: number;

  @Expose()
  get astraWidgetUrl(): string {
    const url = new URL(
      `${process.env.ASTRA_WIDGET_URL}/login/oauth/authorize`,
    );

    url.searchParams.append('client_id', process.env.ASTRA_CLIENT_ID);
    url.searchParams.append('redirect_uri', this.astraRedirectUri);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('user_intent_id', this.astraUserIntentId);
    url.searchParams.append('phone', this.phone ? this.phone.substr(2) : '');
    url.searchParams.append('phone_read_only', 'true');

    return url.href;
  }

  @Expose()
  get manageAccountsUrl(): string {
    const url = new URL(`${process.env.ASTRA_WIDGET_URL}/institutions/connect`);

    url.searchParams.append('client_id', process.env.ASTRA_CLIENT_ID);
    url.searchParams.append('redirect_uri', this.astraRedirectUri);

    return url.href;
  }
}
