import { IsBooleanString, IsOptional, IsString } from 'class-validator';

export class TransactionSeriesQuery {
  @IsBooleanString()
  @IsOptional()
  isRecurring?: string;

  @IsBooleanString()
  @IsOptional()
  isIncome?: string;

  @IsString()
  @IsOptional()
  recurringConfidence?: string;
}
