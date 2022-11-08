import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { CategorizedTransaction } from './entities/categorized-transaction.entity';
import { Category } from './entities/category.entity';
import { TransactionSeries } from './entities/transaction-series.entity';
import { TransactionsService } from './transactions.service';
import { SentryInterceptor } from 'src/common/interceptors/sentry.interceptor';
import { CreateSeriesPreferenceDto } from './dto/create-series-preference.dto';
import { UserId } from 'src/common/decorators/user-id.decorator';
import { TransactionSeriesQuery } from './dto/transaction-series-query.dto';
import { User } from 'src/users/entities/user.entity';
import { WPUser } from 'src/common/decorators/wp-user.decorator';
import { ExpensesQueryDto } from './dto/expenses-query.dto';
import { TransactionsQueryDto } from './dto/transactions-query.dto';
import { Pagination } from 'nestjs-typeorm-paginate';

@UseInterceptors(SentryInterceptor)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @UseGuards(AuthGuard())
  @Get('')
  get(
    @Req() req: Request,
    @Query() query: TransactionsQueryDto,
  ): Promise<Pagination<CategorizedTransaction>> {
    const user: any = req.user;
    return this.transactionsService.findTransactions(user.sub, query, {
      page: query.page,
      limit: query.limit,
      route: req.route.path,
    });
  }

  @UseGuards(AuthGuard())
  @Get('/expenses')
  getExpenses(
    @WPUser() user: User,
    @Query() expensesQueryDto: ExpensesQueryDto,
  ) {
    return this.transactionsService.getExpenses(user, expensesQueryDto);
  }

  @UseGuards(AuthGuard())
  @Get('/series')
  @UseInterceptors(ClassSerializerInterceptor)
  getSeries(
    @UserId() userId: string,
    @Query() query: TransactionSeriesQuery,
  ): Promise<TransactionSeries[]> {
    return this.transactionsService.findSeries(userId, query);
  }

  //category recurring
  @UseGuards(AuthGuard())
  @Get('/category')
  getCategory(@Req() req: Request, @Query() query): Promise<Category[]> {
    return this.transactionsService.findCategory(query);
  }

  @UseGuards(AuthGuard())
  @Patch('/series/:seriesId/preferences')
  addConsumerSeries(
    @UserId() userId: string,
    @Param('seriesId') seriesId: string,
    @Body() seriesPreferenceDto: CreateSeriesPreferenceDto,
  ) {
    return this.transactionsService.addSeriesPreference(
      userId,
      seriesId,
      seriesPreferenceDto,
    );
  }
}
