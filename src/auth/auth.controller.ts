import {
  Body,
  Controller,
  HttpCode,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { RealIP } from 'nestjs-real-ip';
import { AstraClient } from 'src/astra/astra-api-client';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { serialize } from 'class-transformer';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Auth0LoginResponse } from './interfaces/auth0-login-response.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('/login')
  async login(@Body() loginDto: LoginDto) {
    const auth0Response: Auth0LoginResponse = await this.authService.login(
      loginDto,
    );
    const user = await this.usersService
      .findOneOrFail({
        where: {
          email: loginDto.email,
        },
      })
      .catch(() => {
        throw new UnauthorizedException('User does not exist.');
      });

    return {
      user: JSON.parse(serialize(user)),
      ...auth0Response,
    };
  }

  @Post('/sign-up')
  async signUp(@RealIP() _ip: string, @Body() signUpDto: SignUpDto) {
    const ip = process.env.NODE_ENV === 'local' ? '127.0.0.1' : _ip;
    const astraUserIntentId = await AstraClient.createUserIntent({
      email: signUpDto.email,
      phone: signUpDto.phone,
      first_name: signUpDto.firstName,
      last_name: signUpDto.lastName,
      address1: signUpDto.address1,
      address2: signUpDto.address2,
      city: signUpDto.city,
      state: signUpDto.state,
      postal_code: signUpDto.postalCode,
      date_of_birth: signUpDto.dob,
      ssn: signUpDto.ssn,
      ip_address: ip,
    });
    const auth0Response = await this.authService.signUp(
      signUpDto.email,
      signUpDto.password,
    );

    const { password, ...updateUserDto } = signUpDto;
    const user = await this.usersService.createOrUpdate(
      `auth0|${auth0Response._id}`,
      astraUserIntentId,
      updateUserDto,
    );
    const loginData = await this.authService.login({
      email: signUpDto.email,
      password: signUpDto.password,
    });

    return {
      ...loginData,
      user: JSON.parse(serialize(user)),
    };
  }

  @Post('/change-password')
  @HttpCode(204)
  async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    await this.authService.changePassword(changePasswordDto);
  }
}
