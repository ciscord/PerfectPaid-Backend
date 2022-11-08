import { PerfectPaidBaseEntity } from 'src/common/entities/base.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Category } from './category.entity';

@Entity()
export class CategorySearchTerm extends PerfectPaidBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ManyToOne(() => Category)
  @JoinColumn()
  category: Category;

  @Column()
  searchTerm: string;
}
