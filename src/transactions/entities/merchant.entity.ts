import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Merchant extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  merchantName: string;

  @Column({ nullable: true })
  plaidMerchantName: string;

  @Column({ nullable: true })
  categoryId: string;

  @Column({ nullable: true })
  parentId: number;

  @Column({ nullable: true, type: 'decimal' })
  weight: number;

  @Column({ nullable: true })
  primary_color: string;

  @Column({ nullable: true })
  merchant_url: string;

  @Column({ nullable: true })
  merchant_logo: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
