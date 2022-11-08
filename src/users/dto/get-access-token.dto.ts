import { IsString, IsUrl } from 'class-validator';

export class GetAccessTokenDto {
  @IsString()
  code: string;

  // require_tld allows for localhost
  @IsUrl({ require_tld: false })
  astraRedirectUri: string;
}
