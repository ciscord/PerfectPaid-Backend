import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { AuthModule } from 'src/auth/auth.module';
import { ConnectionsModule } from 'src/connections/connections.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupTransaction } from './entities/group-transaction.entity';

@Module({
  imports: [
    AuthModule,
    ConnectionsModule,
    TypeOrmModule.forFeature([GroupTransaction]),
  ],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
