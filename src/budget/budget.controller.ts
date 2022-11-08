import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BudgetService } from './budget.service';
import { WPUser } from '../common/decorators/wp-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('budget')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @UseGuards(AuthGuard())
  @Get('/income')
  getIncome(@WPUser() user: User) {
    return this.budgetService.getIncomeSummary(user);
  }

  @UseGuards(AuthGuard())
  @Get('/expenses')
  getExpenses(@WPUser() user: User) {
    return this.budgetService.getExpenseSummary(user);
  }
}
