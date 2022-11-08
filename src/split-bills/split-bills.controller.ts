import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  Query,
  Get,
  Patch,
  Param,
} from '@nestjs/common';
import { SplitBillsService } from './split-bills.service';
import { CreateSplitBillDto } from './dto/create-split-bill.dto';
import { AuthGuard } from '@nestjs/passport';
import { FindSplitBillsQuery } from './dto/find-split-bills-query.dto';
import { WPUser } from 'src/common/decorators/wp-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Controller('split-bills')
export class SplitBillsController {
  constructor(private readonly splitBillsService: SplitBillsService) {}

  @UseGuards(AuthGuard())
  @HttpCode(204)
  @Post()
  async create(
    @WPUser() user: User,
    @Body() createSplitBillDto: CreateSplitBillDto,
  ) {
    await this.splitBillsService.create(user, createSplitBillDto);
  }

  @UseGuards(AuthGuard())
  @Get()
  findSplit(@WPUser() user: User, @Query() query: FindSplitBillsQuery) {
    return this.splitBillsService.findSplitBillsToAccept(user, query);
  }

  @UseGuards(AuthGuard())
  @Patch(':splitBillId/accept')
  update(@WPUser() user: User, @Param('splitBillId') splitBillId: number) {
    return this.splitBillsService.acceptBill(user, splitBillId);
  }
}
