import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { NumberOfTransfers } from 'src/common/utils/transfers';
import {
  RepeatUntil,
  SplitMethod,
  TransferTiming,
} from '../entities/split-bill.entity';

export class CreateSplitBillDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SplitBill)
  splitBills: SplitBill[];
}

export class SplitBillConnection {
  @IsInt()
  id: number;

  @IsNumber()
  amount: number;
}

export class SplitBill {
  @IsUUID(4)
  transactionSeriesId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SplitBillConnection)
  connections: SplitBillConnection[];

  @IsString()
  accountId: string;

  @IsEnum(SplitMethod)
  splitMethod: SplitMethod;

  @IsEnum(TransferTiming)
  transferTiming: TransferTiming;

  @IsString()
  @ValidateIf((o) => o.transferTiming === TransferTiming.OneTime)
  categorizedTransactionId?: string;

  @IsDateString()
  @ValidateIf((o) => o.transferTiming === TransferTiming.FixedDate)
  dueDate?: string;

  @IsBoolean()
  @IsOptional()
  tip?: boolean;

  @IsInt()
  @ValidateIf((o) => o.tip === true)
  tipAmount?: number;

  @IsEnum(RepeatUntil)
  @ValidateIf((o) => o.transferTiming !== TransferTiming.OneTime)
  repeatUntil?: RepeatUntil;

  @IsIn(NumberOfTransfers)
  @ValidateIf((o) => o.repeatUntil === RepeatUntil.NumberOfTransfers)
  repeatUntilNumber?: number;
}
