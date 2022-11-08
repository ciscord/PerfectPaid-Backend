import {
  IsBooleanString,
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { expenseCategories } from 'src/common/utils/expenses';
import { Type } from 'class-transformer';

export class TransactionsQueryDto {
  @IsString()
  @IsOptional()
  search: string;

  @IsDateString()
  @IsOptional()
  date: string;

  @IsIn(expenseCategories.map((o) => o.id))
  @IsOptional()
  category: string;

  @IsBooleanString()
  @IsOptional()
  isRecurring: string;

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  page: number;

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(50)
  @IsOptional()
  limit: number;
}
