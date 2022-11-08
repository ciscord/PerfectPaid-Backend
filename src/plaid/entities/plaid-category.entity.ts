import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Category } from '../../transactions/entities/category.entity';

@Entity()
export class PlaidCategory {
  @PrimaryColumn()
  plaidCategoryId: string;

  @Column()
  plaidCategoryName: string;

  @ManyToOne(() => Category)
  @JoinColumn()
  category: Category;
}
