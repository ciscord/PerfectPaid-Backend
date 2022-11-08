import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as ormconfig from '../ormconfig';
import { SeedService } from './seed.service';
import { Auth0Service } from '../common/services/auth0.service';
import { UsersModule } from '../users/users.module';
@Module({
  imports: [
    TypeOrmModule.forRoot(
      Object.assign(ormconfig, {
        autoLoadEntities: true,
      }),
    ),
    UsersModule,
  ],
  providers: [SeedService, Auth0Service],
})
export class SeedModule {}
