import { BaseEntity, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export class PerfectPaidBaseEntity extends BaseEntity {
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
