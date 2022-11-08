import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Like, QueryFailedError, Repository } from 'typeorm';
import { DateTime } from 'luxon';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { TokenDataType } from './interfaces/token-data-type.interface';
import { AstraClient } from 'src/astra/astra-api-client';
import { DateFormat } from 'src/common/utils/date';
import { PatchUserDto } from './dto/patch-user.dto';
import { AstraAccount } from 'src/astra/entities/astra-account.entity';
import { AstraAccountSubtype } from 'src/common/utils/astra';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createOrUpdate(
    userId: string,
    astraUserIntentId: string,
    updateUserDto: UpdateUserDto,
  ) {
    const firstName = updateUserDto.firstName.split(' ')[0].toLowerCase();
    const lastName = updateUserDto.lastName.split(' ')[0].toLowerCase();
    const username = `${firstName}.${lastName}`;
    const usernameCount = await this.numberOfUsernamesLike(username);
    const user = User.create({
      id: userId,
      astraUserIntentId: astraUserIntentId,
      ...updateUserDto,
    });

    const numberOfRetries = 5;
    for (let retry = 0; retry < numberOfRetries; retry++) {
      try {
        const usernameNumber = usernameCount + retry;
        user.username = username + (usernameNumber || '');
        await User.insert(user);
        break;
      } catch (e) {
        const code = e.code;
        const detail = e.detail;

        if (
          e instanceof QueryFailedError &&
          code === '23505' &&
          detail.contains('Key (username)')
        ) {
          // Duplicate username error
          // Do nothing. Keep retrying
        } else {
          throw e;
        }
      }
    }

    return user;
  }

  numberOfUsernamesLike(username: string): Promise<number> {
    return User.count({
      username: Like(`${username}%`),
    });
  }

  findOne(query: any): Promise<User> {
    return User.findOne({ where: query });
  }

  findOneOrFail(query: FindManyOptions<User>) {
    return User.findOneOrFail(query);
  }

  async getUser(userId: string): Promise<User> {
    const user = await User.findOneOrFail({ id: userId });
    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    await this.userRepository.update({ id: id }, updateUserDto);
    return User.findOne(id);
  }

  async patchUser(id: string, patchUserDto: PatchUserDto) {
    const { primaryAccountId, ...restOfPathUserDto } = patchUserDto;
    const patchData: QueryDeepPartialEntity<User> = restOfPathUserDto;

    if (primaryAccountId) {
      const account = await AstraAccount.findOneOrFail({
        where: {
          id: primaryAccountId,
          user: { id },
          subtype: AstraAccountSubtype.Checking,
        },
      }).catch(() => {
        throw new NotFoundException('Checking account does not exist.');
      });

      patchData.primaryAccount = account;
    }

    await this.userRepository.update({ id: id }, patchData);
    return User.findOne(id);
  }

  async refreshAstraToken(user: User): Promise<TokenDataType> {
    const tokenData = await AstraClient.getAccessToken(
      user.refreshToken,
      'refresh_token',
      user.astraRedirectUri,
    );

    await this.updateUser(user.id, {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      refreshDate: DateTime.now().plus({ days: 9 }).toFormat(DateFormat),
    });
    return tokenData;
  }
}
