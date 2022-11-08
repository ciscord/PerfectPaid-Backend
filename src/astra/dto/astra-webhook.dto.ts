import { IsArray, IsEnum, IsString, ValidateIf } from 'class-validator';

export enum WebhookType {
  TRANSACTIONS_HISTORICAL_UPDATE = 'transactions_historical_update',
  TRANSACTIONS_DEFAULT_UPDATE = 'transactions_default_update',
  TRANSACTIONS_REMOVED = 'transactions_removed',
}

export class AstraWebhookDto {
  @IsEnum(WebhookType)
  webhook_type: WebhookType;

  @IsString()
  webhook_id: string;

  @IsString()
  user_id: string;

  @IsString()
  resource_id: string;

  @IsArray()
  @ValidateIf((o) => o.webhook_type === WebhookType.TRANSACTIONS_REMOVED)
  removed_transactions: string[];
}
