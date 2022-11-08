import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { GroupCategory } from './entities/group-category.entity';
import { Group, GroupPermission } from './entities/group.entity';
import { createQueryBuilder, Repository } from 'typeorm';
import { PatchGroupDto } from './dto/patch-group.dto';
import { GroupMembersDto } from './dto/group-members.dto';
import { GroupTransactionsDto } from './dto/group-transactions.dto';
import { CategorizedTransaction } from '../transactions/entities/categorized-transaction.entity';
import { GroupTransaction } from './entities/group-transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindGroupTransactionsDto } from './dto/find-group-transactions.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(GroupTransaction)
    private transactionsRepository: Repository<GroupTransaction>,
  ) {}
  async find(userId: string) {
    return this.getGroupQueryBuilder()
      .where('group.owner_id = :id', { id: userId })
      .orWhere('member.id = :id', { id: userId })
      .getMany();
  }

  async create(owner: User, createGroupDto: CreateGroupDto) {
    const category = await GroupCategory.findOneOrFail(
      createGroupDto.categoryId,
    );
    if (createGroupDto.memberIds.some((memberId) => memberId == owner.id)) {
      throw new BadRequestException(
        'The owner of the group should not be in the members array.',
      );
    }
    const members = await this.findUsersOrFail(createGroupDto.memberIds);

    return Group.create({
      name: createGroupDto.name,
      owner,
      category,
      members,
      editors: createGroupDto.editors,
      requesters: createGroupDto.requesters,
      deletePolicy: createGroupDto.deletePolicy,
    }).save();
  }

  async delete(groupId: number, userId: string) {
    await this.getGroupQueryBuilder()
      .where('id = :groupId', { groupId })
      .andWhere('owner.id = :userId', { userId })
      .delete()
      .execute();
  }

  async update(groupId: number, userId: string, patchGroupDto: PatchGroupDto) {
    const group = await this.findEditableGroupOrFail(groupId, userId);

    if (patchGroupDto.name) {
      group.name = patchGroupDto.name;
    }
    if (patchGroupDto.editors) {
      group.editors = patchGroupDto.editors;
    }
    if (patchGroupDto.requesters) {
      group.requesters = patchGroupDto.requesters;
    }
    if (patchGroupDto.deletePolicy) {
      group.deletePolicy = patchGroupDto.deletePolicy;
    }

    if (patchGroupDto.categoryId) {
      group.category = await GroupCategory.findOneOrFail(
        patchGroupDto.categoryId,
      );
    }

    await group.save();
    return group;
  }

  async addMembers(
    groupId: number,
    userId: string,
    groupMembersDto: GroupMembersDto,
  ) {
    if (groupMembersDto.memberIds.some((memberId) => memberId == userId)) {
      throw new BadRequestException(
        'The owner of the group should not be in the members array.',
      );
    }

    const group = await this.findEditableGroupOrFail(groupId, userId);
    const existingMemberIds = group.members.map((member) => member.id);
    const newMemberIds = groupMembersDto.memberIds.filter(
      (memberId) => !existingMemberIds.includes(memberId),
    );
    const members = await this.findUsersOrFail(newMemberIds);
    group.members.push(...members);
    return await group.save();
  }

  async removeMember(groupId: number, userId: string, memberId: string) {
    if (userId != memberId) {
      throw new ForbiddenException('Member may only remove self from a group.');
    }

    const group = await this.getGroupQueryBuilder()
      .where('group.id = :groupId', { groupId })
      .andWhere('member.id = :id', { id: userId })
      .getOneOrFail();

    group.members = group.members.filter(
      (member: User) => member.id != memberId,
    );

    return await group.save();
  }

  async getTransactions(
    groupId: number,
    userId: string,
    query: FindGroupTransactionsDto,
  ) {
    const group = await this.findGroupContainingMemberOrFail(groupId, userId);
    const builder = GroupTransaction.createQueryBuilder(GroupTransaction.name)
      .where('group_id = :groupId', { groupId: group.id })
      .leftJoinAndSelect(`${GroupTransaction.name}.transaction`, 'transaction');

    if (query.settled == 'true') {
      builder.andWhere('settled_at is not NULL');
    } else if (query.settled == 'false') {
      builder.andWhere('settled_at is NULL');
    }

    return builder.getMany();
  }

  async putTransactions(
    groupId: number,
    userId: string,
    groupTransactionsDto: GroupTransactionsDto,
  ) {
    const group = await this.findGroupContainingMemberOrFail(groupId, userId);
    if (
      group.owner.id != userId &&
      group.requesters != GroupPermission.Everyone
    ) {
      throw new ForbiddenException(
        'Not allowed to add transactions to this group.',
      );
    }

    const transactions = await CategorizedTransaction.findByIds(
      groupTransactionsDto.transactionIds,
    );
    const groupTransactions = transactions.map((transaction) =>
      GroupTransaction.create({ group, transaction }),
    );
    await GroupTransaction.insert(groupTransactions);
  }

  async deleteTransaction(
    groupId: number,
    userId: string,
    transactionId: number,
  ) {
    const groupTransaction = await GroupTransaction.findOneOrFail({
      where: { id: transactionId, group: { id: groupId } },
      relations: ['group', 'group.owner', 'transaction', 'transaction.user'],
    });
    if (
      groupTransaction.group.owner.id != userId &&
      groupTransaction.transaction.user.id != userId
    ) {
      throw new ForbiddenException(
        'Only the owner of the group or transaction may remove it.',
      );
    }
    return await groupTransaction.remove();
  }

  private async findUsersOrFail(userIds: string[]) {
    const users = await User.findByIds(userIds);
    if (users.length < userIds.length) {
      throw new NotFoundException('Users not found.');
    }
    return users;
  }

  private getGroupQueryBuilder(extraRelations?: [string, string][]) {
    let builder = createQueryBuilder(Group, 'group')
      .leftJoinAndSelect('group.category', 'category')
      .leftJoinAndSelect('group.owner', 'owner')
      .leftJoinAndSelect('group.members', 'member');

    if (extraRelations) {
      extraRelations.forEach(
        (relation) =>
          (builder = builder.leftJoinAndSelect(relation[0], relation[1])),
      );
    }
    return builder;
  }

  private async findGroupContainingMemberOrFail(
    groupId: number,
    userId: string,
    extraRelations?: [string, string][],
  ) {
    const group = await this.getGroupQueryBuilder(extraRelations)
      .where('group.id = :groupId', { groupId })
      .getOneOrFail();

    const userIsOwner = group.owner.id == userId;
    const userInGroup =
      userIsOwner || group.members.some((member: User) => member.id == userId);

    if (!userInGroup) {
      throw new ForbiddenException('User does not belong to this group.');
    }

    return group;
  }

  private async findEditableGroupOrFail(groupId: number, userId: string) {
    const group = await this.findGroupContainingMemberOrFail(groupId, userId);
    const userIsOwner = group.owner.id == userId;

    if (!userIsOwner && group.editors != GroupPermission.Everyone) {
      throw new ForbiddenException('User is not allowed to edit this group.');
    }

    return group;
  }
}
