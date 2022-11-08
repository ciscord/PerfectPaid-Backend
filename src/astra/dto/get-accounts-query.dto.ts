import { IsIn, IsOptional } from 'class-validator';
import { AccountSubtypes } from 'src/common/utils/accounts';

export class GetAccountsQueryDto {
  @IsIn(AccountSubtypes)
  @IsOptional()
  subtype: string;
}
