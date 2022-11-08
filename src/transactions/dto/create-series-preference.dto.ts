import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSeriesPreferenceDto {
  @IsString()
  @IsOptional()
  seriesNickname?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @IsBoolean()
  @IsOptional()
  isSavings?: boolean;

  @IsBoolean()
  @IsOptional()
  isIncome?: boolean;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  frequency?: string;

  @IsDateString()
  @IsOptional()
  nextDate?: string;
}
