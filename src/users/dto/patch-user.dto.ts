import { PartialType } from '@nestjs/mapped-types';
import { PickType } from '@nestjs/swagger';
import { UpdateUserDto } from './update-user.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class PatchUserDto extends PartialType(
  PickType(UpdateUserDto, [
    'address1',
    'address2',
    'city',
    'dob',
    'firstName',
    'lastName',
    'phone',
    'postalCode',
    'preferredName',
    'ssn',
    'state',
  ] as const),
) {
  @IsNumber()
  @IsOptional()
  monthlyIncome?: number;

  @IsString()
  @IsOptional()
  primaryAccountId?: string;
}
