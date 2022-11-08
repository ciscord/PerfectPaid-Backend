import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WPUser } from 'src/common/decorators/wp-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { CreateRecurringTransferDto } from './dto/create-recurring-transfer.dto';
import { TransfersService } from './transfers.service';

@Controller('transfers')
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @UseGuards(AuthGuard())
  @Post('/recurring')
  createRecurringTransfer(
    @WPUser() user: User,
    @Body() createRecurringTransferDto: CreateRecurringTransferDto,
  ) {
    return this.transfersService.createRecurringTransfer(
      user,
      createRecurringTransferDto,
    );
  }
}
