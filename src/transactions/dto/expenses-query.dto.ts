import { IsDateString } from 'class-validator';

export class ExpensesQueryDto {
  @IsDateString()
  date: string;
}
