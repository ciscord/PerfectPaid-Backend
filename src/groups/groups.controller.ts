import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put, Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { Group } from './entities/group.entity';
import { WPUser } from 'src/common/decorators/wp-user.decorator';
import { User } from '../users/entities/user.entity';
import { UserId } from '../common/decorators/user-id.decorator';
import { PatchGroupDto } from './dto/patch-group.dto';
import { GroupMembersDto } from './dto/group-members.dto';
import { GroupTransactionsDto } from './dto/group-transactions.dto';
import {TransactionsQueryDto} from "../transactions/dto/transactions-query.dto";
import {FindGroupTransactionsDto} from "./dto/find-group-transactions.dto";

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @UseGuards(AuthGuard())
  @Get()
  async find(@UserId() userId: string) {
    return this.groupsService.find(userId);
  }

  @UseGuards(AuthGuard())
  @Post()
  async create(
    @WPUser() user: User,
    @Body() createGroupDto: CreateGroupDto,
  ): Promise<Group> {
    return this.groupsService.create(user, createGroupDto);
  }

  @UseGuards(AuthGuard())
  @HttpCode(204)
  @Delete(':group_id')
  async delete(@UserId() userId: string, @Param('group_id') groupId: number) {
    await this.groupsService.delete(groupId, userId);
  }

  @UseGuards(AuthGuard())
  @Patch(':group_id')
  async update(
    @UserId() userId: string,
    @Param('group_id') groupId: number,
    @Body() patchGroupDto: PatchGroupDto,
  ): Promise<Group> {
    return await this.groupsService.update(groupId, userId, patchGroupDto);
  }

  @UseGuards(AuthGuard())
  @Put(':group_id/members')
  async addMembers(
    @UserId() userId: string,
    @Param('group_id') groupId: number,
    @Body() groupMembersDto: GroupMembersDto,
  ): Promise<Group> {
    return await this.groupsService.addMembers(
      groupId,
      userId,
      groupMembersDto,
    );
  }

  @UseGuards(AuthGuard())
  @Delete(':group_id/members/:member_id')
  async removeMember(
    @UserId() userId: string,
    @Param('group_id') groupId: number,
    @Param('member_id') memberId: string,
  ): Promise<Group> {
    return await this.groupsService.removeMember(groupId, userId, memberId);
  }

  @UseGuards(AuthGuard())
  @Get(':group_id/transactions')
  getTransactions(
    @UserId() userId: string,
    @Param('group_id') groupId: number,
    @Query() query: FindGroupTransactionsDto,
  ) {
    return this.groupsService.getTransactions(groupId, userId, query);
  }

  @UseGuards(AuthGuard())
  @Put(':group_id/transactions')
  @HttpCode(204)
  async putTransactions(
    @UserId() userId: string,
    @Param('group_id') groupId: number,
    @Body() groupTransactionsDto: GroupTransactionsDto,
  ) {
    await this.groupsService.putTransactions(
      groupId,
      userId,
      groupTransactionsDto,
    );
  }

  @UseGuards(AuthGuard())
  @Delete(':group_id/transactions/:transaction_id')
  @HttpCode(204)
  async deleteTransaction(
    @UserId() userId: string,
    @Param('group_id') groupId: number,
    @Param('transaction_id') transactionId: number,
  ) {
    await this.groupsService.deleteTransaction(groupId, userId, transactionId);
  }
}
