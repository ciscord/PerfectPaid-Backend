import { PartialType } from '@nestjs/swagger';
import { CreateSplitBillDto } from './create-split-bill.dto';

export class UpdateSplitBillDto extends PartialType(CreateSplitBillDto) {}
