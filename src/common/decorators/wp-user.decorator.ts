import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { User as UserEntity } from 'src/users/entities/user.entity';

export const WPUser = createParamDecorator(
  async (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return UserEntity.findOneOrFail(user['sub']).catch(() => {
      throw new UnauthorizedException('No PerfectPaid user exists.');
    });
  },
);
