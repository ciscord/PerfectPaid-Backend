import { IsString } from 'class-validator';

export class CreateConsumerTransactionDto {
  @IsString()
  transactionId: string;
}
