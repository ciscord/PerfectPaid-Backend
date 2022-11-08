import { Type } from 'class-transformer';
import { IsBooleanString, IsIn, IsNumber, IsOptional } from 'class-validator';
import { enumToList } from 'src/common/utils/mutating';
import { SplitBillsQueryTypes } from 'src/common/utils/split-bills';

export class FindSplitBillsQuery {
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  connectionId: number;

  @IsIn(enumToList(SplitBillsQueryTypes))
  @IsOptional()
  type: string;

  @IsBooleanString()
  @IsOptional()
  accepted: boolean;
}
