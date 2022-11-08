import { IsEmail } from 'class-validator';

export class ChangePasswordDto {
  @IsEmail()
  email: string;
}
