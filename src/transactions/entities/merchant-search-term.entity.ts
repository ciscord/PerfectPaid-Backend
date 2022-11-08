import { PerfectPaidBaseEntity } from 'src/common/entities/base.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Merchant } from './merchant.entity';

@Entity()
export class MerchantSearchTerm extends PerfectPaidBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ManyToOne(() => Merchant)
  @JoinColumn()
  merchant: Merchant;

  @Column()
  searchTerm: string;
}
