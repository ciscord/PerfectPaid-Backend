import { Transform } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

export class SignUpDto extends CreateUserDto {
  @IsEmail()
  @Transform(({ value }: { value: string }) => value.toLowerCase(), {
    toClassOnly: true, // https://github.com/nestjs/nest/issues/3842
  })
  email: string;

  @IsString()
  password: string;
}
