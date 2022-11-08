import {
  Controller,
  Body,
  UseGuards,
  Req,
  BadRequestException,
  Post,
  HttpCode,
  Get,
  UseInterceptors,
  ClassSerializerInterceptor,
  Patch,
} from '@nestjs/common';
import { DateTime } from 'luxon';
import { Request } from 'express';
import { RealIP } from 'nestjs-real-ip';
import { AuthGuard } from '@nestjs/passport';
import axios from 'axios';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { GetAccessTokenDto } from './dto/get-access-token.dto';
import { User as UserEntity } from './entities/user.entity';
import { SentryInterceptor } from 'src/common/interceptors/sentry.interceptor';
import { UserId } from 'src/common/decorators/user-id.decorator';
import { User } from 'src/common/decorators/user.decorator';
import { AstraClient } from 'src/astra/astra-api-client';
import { PatchUserDto } from './dto/patch-user.dto';
import { AstraService } from 'src/astra/astra.service';
import { DateFormat } from 'src/common/utils/date';

@UseInterceptors(SentryInterceptor)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly astraService: AstraService,
  ) {}

  @UseGuards(AuthGuard())
  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  async create(
    @Req() req: Request,
    @UserId() userId: string,
    @User('aud') audience: string[],
    @RealIP() _ip: string,
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserEntity> {
    let email: any;
    const userInfoUrl = audience[1];

    try {
      const response = await axios.get(userInfoUrl, {
        headers: {
          Authorization: req.headers.authorization,
        },
      });
      email = response.data.email;
    } catch (e) {
      throw new BadRequestException(
        'Error getting user information.',
        e.response.message,
      );
    }

    const ip = process.env.NODE_ENV === 'local' ? '127.0.0.1' : _ip;
    const astraUserIntentId = await AstraClient.createUserIntent({
      email,
      phone: createUserDto.phone,
      first_name: createUserDto.firstName,
      last_name: createUserDto.lastName,
      address1: createUserDto.address1,
      address2: createUserDto.address2,
      city: createUserDto.city,
      state: createUserDto.state,
      postal_code: createUserDto.postalCode,
      date_of_birth: createUserDto.dob,
      ssn: createUserDto.ssn,
      ip_address: ip,
    });

    const updateUserDto = {
      ...createUserDto,
      email,
    };
    return this.usersService.createOrUpdate(
      userId,
      astraUserIntentId,
      updateUserDto,
    );
  }

  // TODO: for admin user to update other users
  @UseGuards(AuthGuard())
  @UseInterceptors(ClassSerializerInterceptor)
  @Patch(['/:id', '/me'])
  updateUser(@UserId() userId: string, @Body() patchUserDto: PatchUserDto) {
    return this.usersService.patchUser(userId, patchUserDto);
  }

  // TODO: Use param id for admin
  @UseGuards(AuthGuard())
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(['/:id', '/me'])
  getUser(@UserId() userId: string) {
    return this.usersService.getUser(userId);
  }

  @UseGuards(AuthGuard())
  @HttpCode(204)
  @Post('access-token')
  async getAccessToken(
    @UserId() userId: string,
    @Body() getAccessTokenDto: GetAccessTokenDto,
  ) {
    const tokenData = await AstraClient.getAccessToken(
      getAccessTokenDto.code,
      'authorization_code',
      getAccessTokenDto.astraRedirectUri,
    );
    const astraClient = new AstraClient(tokenData.access_token);
    const astraUser = await astraClient.getUser();
    await this.usersService.updateUser(userId, {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      refreshDate: DateTime.now().plus({ days: 9 }).toFormat(DateFormat),
      astraUserId: astraUser.id,
    });
    await this.astraService.refreshAccounts(userId);
  }
}
