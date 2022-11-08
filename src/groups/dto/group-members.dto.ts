import { PickType } from '@nestjs/swagger';
import { CreateGroupDto } from '../../groups/dto/create-group.dto';

export class GroupMembersDto extends PickType(CreateGroupDto, [
  'memberIds',
] as const) {}
