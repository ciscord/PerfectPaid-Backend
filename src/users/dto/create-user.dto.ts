import {
  IsString,
  IsNumberString,
  IsPostalCode,
  IsPhoneNumber,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsOptional()
  preferredName: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsPhoneNumber('US')
  phone: string;

  @IsString()
  address1: string;

  @IsString()
  address2: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  @IsPostalCode('US')
  postalCode: string;

  @IsString()
  dob: string;

  @IsNumberString()
  ssn: string;

  @IsUrl({
    protocols: ['http', 'https', 'exp'],
    // require_tld allows for localhost
    require_tld: false,
  })
  astraRedirectUri: string;
}
