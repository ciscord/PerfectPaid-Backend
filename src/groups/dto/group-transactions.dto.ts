import { ArrayMinSize, IsArray } from 'class-validator';

export class GroupTransactionsDto {
  @IsArray()
  @ArrayMinSize(1)
  transactionIds: string[];
}
