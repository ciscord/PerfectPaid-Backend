import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  In,
  Between,
  FindConditions,
  ObjectLiteral,
  Brackets,
} from 'typeorm';
import { DateTime } from 'luxon';
import { Category } from './entities/category.entity';
import { CategorizedTransaction } from './entities/categorized-transaction.entity';
import { TransactionSeries } from './entities/transaction-series.entity';
import { ConsumerPreferenceSeries } from './entities/consumer-preference-series.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateSeriesPreferenceDto } from './dto/create-series-preference.dto';
import { TransactionSeriesQuery } from './dto/transaction-series-query.dto';
import { DateFormat } from 'src/common/utils/date';
import { ExpensesQueryDto } from './dto/expenses-query.dto';
import { expenseCategories } from 'src/common/utils/expenses';
import { TransactionsQueryDto } from './dto/transactions-query.dto';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(TransactionSeries)
    private readonly transactionSeriesRepository: Repository<TransactionSeries>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async getExpenses(user: User, expensesQueryDto: ExpensesQueryDto) {
    const recurringExpensesCategoryName = 'Recurring Expenses';
    const expenses = {};
    const currentMonth = DateTime.fromISO(expensesQueryDto.date);
    const lastThreeMonths = [
      currentMonth,
      currentMonth.minus({ months: 1 }),
      currentMonth.minus({ months: 2 }),
    ];

    for (const expenseCategory of expenseCategories) {
      const categories = await this.findCategories(expenseCategory.where);
      expenses[expenseCategory.label] = [];

      for (const dateTime of lastThreeMonths) {
        const sum = await this.getSumOfTransactionsForCategories(
          user,
          categories,
          dateTime.startOf('month').toFormat(DateFormat),
          dateTime.endOf('month').toFormat(DateFormat),
        );
        expenses[expenseCategory.label].push({
          month: dateTime.toFormat('yyyy-LL'),
          sum,
        });
      }
    }

    expenses[recurringExpensesCategoryName] = [];
    for (const dateTime of lastThreeMonths) {
      const sum = await this.getSumOfRecurringExpenses(
        user,
        dateTime.startOf('month').toFormat(DateFormat),
        dateTime.endOf('month').toFormat(DateFormat),
      );
      expenses[recurringExpensesCategoryName].push({
        month: dateTime.toFormat('yyyy-LL'),
        sum,
      });
    }

    return expenses;
  }

  async findCategories(where: FindConditions<Category>) {
    const categories = await Category.find({
      where,
    });

    return categories;
  }

  async getSumOfTransactionsForCategories(
    user: User,
    categories: Category[],
    from: string,
    to: string,
  ) {
    const { sum } = await CategorizedTransaction.createQueryBuilder(
      CategorizedTransaction.name,
    )
      .select('SUM(amount)', 'sum')
      .leftJoin(
        `${CategorizedTransaction.name}.transactionSeries`,
        'transactionSeries',
      )
      .where({
        user,
        category: In(categories.map((o) => o.id)),
        createDate: Between(from, to),
      })
      .andWhere(
        "(transactionSeries.isRecurring = FALSE OR (transactionSeries.isRecurring = TRUE AND transactionSeries.recurringConfidence IN ('low', 'high')))",
      )
      .getRawOne();

    return sum || 0;
  }

  async getSumOfRecurringExpenses(user: User, from: string, to: string) {
    const { sum } = await CategorizedTransaction.createQueryBuilder(
      CategorizedTransaction.name,
    )
      .select('SUM(amount)', 'sum')
      .leftJoin(
        `${CategorizedTransaction.name}.transactionSeries`,
        'transactionSeries',
      )
      .where([
        {
          user,
          createDate: Between(from, to),
        },
      ])
      .andWhere('transactionSeries.isRecurring = :isRecurring', {
        isRecurring: true,
      })
      .andWhere(
        'transactionSeries.recurringConfidence = :recurringConfidence',
        {
          recurringConfidence: 'high',
        },
      )
      .getRawOne();

    return sum || 0;
  }

  async findTransactions(
    userId: string,
    transactionsQueryDto: TransactionsQueryDto,
    paginationOptions: IPaginationOptions,
  ): Promise<Pagination<CategorizedTransaction>> {
    const { date, category, isRecurring, search } = transactionsQueryDto;
    const findConditions: ObjectLiteral = {
      user: {
        id: userId,
      },
    };

    if (date) {
      const dateTime = DateTime.fromISO(date);
      findConditions.createDate = Between(
        dateTime.startOf('month').toFormat(DateFormat),
        dateTime.endOf('month').toFormat(DateFormat),
      );
    }

    if (category) {
      const expenseCategory = expenseCategories.filter(
        (o) => category === o.id,
      )[0];
      const categories = await this.findCategories(expenseCategory.where);

      findConditions.category = In(categories.map((o) => o.id));
    }

    const queryBuilder = CategorizedTransaction.createQueryBuilder(
      CategorizedTransaction.name,
    )
      .leftJoin(
        `${CategorizedTransaction.name}.transactionSeries`,
        'transactionSeries',
      )
      .leftJoin(
        `transactionSeries.consumerPreferenceSeries`,
        'consumerPreferenceSeries',
      )
      .leftJoin(`${CategorizedTransaction.name}.merchant`, 'merchant')
      .leftJoin(`${CategorizedTransaction.name}.category`, 'category')
      .select(`${CategorizedTransaction.name}`)
      .addSelect(['transactionSeries.id', 'transactionSeries.isRecurring'])
      .addSelect(['consumerPreferenceSeries.isRecurring'])
      .addSelect(['merchant.merchantName'])
      .addSelect(['category.*'])
      .leftJoinAndSelect(`${CategorizedTransaction.name}.account`, 'account')
      .where(findConditions)
      .setParameter('search', `%${search}%`);

    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('merchant.merchantName ilike :search').orWhere(
            `${CategorizedTransaction.name}.transactionDescription ilike :search`,
          );
        }),
      );
    }

    if (isRecurring !== undefined) {
      queryBuilder.andWhere('transactionSeries.isRecurring = :isRecurring', {
        isRecurring: isRecurring || false,
      });
    }

    return paginate<CategorizedTransaction>(queryBuilder, paginationOptions);
  }

  findSeries(
    userId: string,
    transactionSeriesQuery: TransactionSeriesQuery,
  ): Promise<TransactionSeries[]> {
    const { recurringConfidence, isRecurring, ...remainingQuery } =
      transactionSeriesQuery;
    const query: ObjectLiteral = {
      ...transactionSeriesQuery,
    };

    if (recurringConfidence) {
      query.recurringConfidence = In(
        transactionSeriesQuery.recurringConfidence.split(','),
      );
    }

    let queryBuilder = TransactionSeries.createQueryBuilder(
      TransactionSeries.name,
    )
      .leftJoinAndSelect(
        `${TransactionSeries.name}.predictedTransactions`,
        'predictedTransactions',
        'predictedTransactions.date >= :date',
      )
      .loadRelationCountAndMap(
        `${TransactionSeries.name}.splitBillsCount`,
        `${TransactionSeries.name}.splitBills`,
      )
      .leftJoinAndSelect(
        `${TransactionSeries.name}.consumerPreferenceSeries`,
        'consumerPreferenceSeries',
      )
      .leftJoinAndSelect(
        'consumerPreferenceSeries.category',
        'preferenceCategory',
      )
      .where({
        user: {
          id: userId,
        },
        ...remainingQuery,
      });

    if (isRecurring) {
      queryBuilder = queryBuilder.andWhere(
        `consumerPreferenceSeries.isRecurring = :isRecurring OR (consumerPreferenceSeries.isRecurring IS NULL and ${TransactionSeries.name}.isRecurring = :isRecurring)`,
      );
    }

    return queryBuilder
      .setParameter('date', DateTime.now().toFormat(DateFormat))
      .setParameter('isRecurring', isRecurring)
      .getMany();
  }

  findCategory(userId: string): Promise<Array<Category>> {
    return this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect(
        'category.categorizedTransactions',
        'catTrx',
        'catTrx.user.id = :userId',
      )
      .setParameter('userId', userId)
      .getMany();
  }

  async addSeriesPreference(
    userId: string,
    seriesId: string,
    seriesPreferenceDto: CreateSeriesPreferenceDto,
  ) {
    const series = await TransactionSeries.findOneOrFail({
      where: {
        id: seriesId,
        user: { id: userId },
      },
      relations: ['consumerPreferenceSeries'],
    }).catch(() => {
      throw new NotFoundException('Series not found.');
    });

    const preferences = ConsumerPreferenceSeries.create({
      user: {
        id: userId,
      },
      ...seriesPreferenceDto,
    });

    if (seriesPreferenceDto.categoryId) {
      preferences.category = await Category.findOneOrFail({
        where: {
          id: seriesPreferenceDto.categoryId,
        },
      }).catch(() => {
        throw new NotFoundException('Category not found.');
      });
    }

    if (series.consumerPreferenceSeries) {
      preferences.id = series.consumerPreferenceSeries.id;
    }

    await preferences.save();

    series.consumerPreferenceSeries = preferences;
    await series.save();
  }
}
