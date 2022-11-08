import { IsBoolean } from 'class-validator';

export class UpdateAccountDto {
  @IsBoolean()
  isPrimary: boolean;
}
