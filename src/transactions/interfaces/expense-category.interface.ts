import { FindConditions } from 'typeorm';
import { Category } from '../entities/category.entity';

export interface ExpenseCategory {
  id: string;
  label: string;
  where: FindConditions<Category>;
}
