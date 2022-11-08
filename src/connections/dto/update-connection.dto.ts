import { IsEnum } from 'class-validator';
import { Status } from '../entities/connection.entity';

export class UpdateConnectionDto {
  @IsEnum(Status)
  status: Status;
}
