import { IsIn, IsOptional, IsString } from 'class-validator';
import { ConnectionsQueryTypes } from 'src/common/utils/connections';
import { enumToList } from 'src/common/utils/mutating';

export class FindConnectionsDto {
  @IsOptional()
  @IsString()
  search: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsIn(enumToList(ConnectionsQueryTypes))
  @IsOptional()
  type?: string;
}
