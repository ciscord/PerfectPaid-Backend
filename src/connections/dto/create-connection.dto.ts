import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  ValidateIf,
} from 'class-validator';

export class CreateConnectionDto {
  @IsString()
  @ValidateIf((o) => o.email === undefined && o.phone === undefined)
  userId?: string;

  @IsString()
  @IsOptional()
  preferredName?: string;

  @IsPhoneNumber('US')
  @ValidateIf((o) => o.userId === undefined && o.email === undefined)
  phone?: string;

  @IsEmail()
  @ValidateIf((o) => o.userId === undefined && o.phone === undefined)
  email?: string;
}
