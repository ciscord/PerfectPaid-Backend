import {
  IsDateString,
  IsEnum,
  IsIn,
  IsNumber,
  IsString,
  ValidateIf,
} from 'class-validator';
import { NumberOfTransfers } from 'src/common/utils/transfers';
import {
  Frequency,
  RepeatUntil,
  Type,
} from '../entities/recurring-transfer.entity';

export class CreateRecurringTransferDto {
  @IsEnum(Type)
  type: Type;

  @IsNumber()
  connectionId: string;

  @IsString()
  description: string;

  @IsNumber()
  amount: number;

  @IsString()
  astraAccountId: string;

  @IsEnum(Frequency)
  frequency: Frequency;

  @IsDateString()
  @ValidateIf((o) => o.frequency !== Frequency.OneTime)
  nextDate: string;

  @IsEnum(RepeatUntil)
  repeatUntil: RepeatUntil;

  @IsIn(NumberOfTransfers)
  @ValidateIf((o) => o.repeatUntil === RepeatUntil.NumberOfTransfers)
  repeatUntilNumber?: number;
}
