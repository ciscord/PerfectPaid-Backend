import { PartialType } from '@nestjs/mapped-types';
import { PickType } from '@nestjs/swagger';
import { CreateGroupDto } from '../../groups/dto/create-group.dto';

export class PatchGroupDto extends PartialType(
  PickType(CreateGroupDto, [
    'name',
    'categoryId',
    'editors',
    'requesters',
    'deletePolicy',
  ] as const),
) {}
