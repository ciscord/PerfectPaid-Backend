import { IsBooleanString, IsOptional } from 'class-validator';

export class FindGroupTransactionsDto {
  @IsBooleanString()
  @IsOptional()
  settled: string;
}
