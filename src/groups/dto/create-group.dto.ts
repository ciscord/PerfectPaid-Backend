import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNumber,
  IsString,
} from 'class-validator';
import { DeletePolicy, GroupPermission } from '../entities/group.entity';

export class CreateGroupDto {
  @IsString()
  name: string;

  @IsNumber()
  categoryId: number;

  @IsArray()
  @ArrayMinSize(1)
  memberIds: string[];

  @IsEnum(GroupPermission)
  editors: GroupPermission;

  @IsEnum(GroupPermission)
  requesters: GroupPermission;

  @IsEnum(DeletePolicy)
  deletePolicy: DeletePolicy;
}
