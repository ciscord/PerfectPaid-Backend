import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PerfectPaidBaseEntity } from '../../common/entities/base.entity';
import { Merchant } from './merchant.entity';
import { ZipCode } from './zip-code.entity';

@Entity()
export class MerchantZipCode extends PerfectPaidBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ManyToOne(() => Merchant)
  @JoinColumn()
  merchant: Merchant;

  @ManyToOne(() => ZipCode)
  @JoinColumn()
  zipCode: ZipCode;

  @Column()
  uniqueUsers: number;
}
