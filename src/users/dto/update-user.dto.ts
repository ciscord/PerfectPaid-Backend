import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  email?: string;
  astraUserId?: string;
  accessToken?: string;
  refreshToken?: string;
  refreshDate?: string;
}
