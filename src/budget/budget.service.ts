import { Injectable } from '@nestjs/common';
import { CategorizedTransaction } from '../transactions/entities/categorized-transaction.entity';
import { groupBy } from 'lodash';
import { abs, mean, sum } from 'mathjs';
import { User } from '../users/entities/user.entity';
import { Category } from '../transactions/entities/category.entity';

@Injectable()
export class BudgetService {
  async getIncomeSummary(user: User) {
    const monthlyTotalsBySeries =
      await CategorizedTransaction.createQueryBuilder('transaction')
        .leftJoin('transaction.user', 'user')
        .leftJoin('transaction.transactionSeries', 'series')
        .select([
          'series.id as "seriesId"',
          'series.seriesName AS "seriesName"',
          "TO_CHAR(transaction.createDate, 'YYYY-MM') as month",
          'SUM(transaction.amount) as amount',
        ])
        .where('user.id = :user_id', { user_id: user.id })
        .andWhere('series.isIncome')
        .andWhere(
          "transaction.createDate > DATE_TRUNC('month', NOW() - INTERVAL '3 month')",
        )
        .groupBy('series.id')
        .addGroupBy('series.seriesName')
        .addGroupBy("TO_CHAR(transaction.createDate, 'YYYY-MM')")
        .getRawMany();

    // getRawMany returns all values as strings
    monthlyTotalsBySeries.forEach(
      (value) => (value.amount = parseFloat(value.amount)),
    );

    const totalsByMonth = groupBy(
      monthlyTotalsBySeries,
      (total) => total.date_month,
    );
    const totals = Object.values(totalsByMonth).map((values) =>
      sum(values.map((series) => series.amount)),
    );
    const estimatedMonthlyIncome = this.trimmedMean(totals);

    return {
      monthlyTotalsBySeries,
      userMonthlyIncome: user.monthlyIncome,
      estimatedMonthlyIncome,
    };
  }

  async getExpenseSummary(user: User) {
    const monthlyTotalsByCategory =
      await CategorizedTransaction.createQueryBuilder('transaction')
        .leftJoin('transaction.user', 'user')
        .leftJoin('transaction.category', 'category')
        .leftJoin('transaction.transactionSeries', 'series')
        .leftJoin('series.consumerPreferenceSeries', 'preference')
        .select([
          'category.recurringGroup as "recurringGroup"',
          "TO_CHAR(transaction.createDate, 'YYYY-MM') as month",
          'SUM(transaction.amount) * -1 as amount',
        ])
        .where('user.id = :user_id', { user_id: user.id })
        .andWhere('COALESCE(preference.is_recurring, series.is_recurring)')
        .andWhere('transaction.amount < 0')
        .andWhere(
          "transaction.createDate > DATE_TRUNC('month', NOW() - INTERVAL '3 month')",
        )
        .groupBy('category.recurringGroup')
        .addGroupBy("TO_CHAR(transaction.createDate, 'YYYY-MM')")
        .getRawMany();

    // getRawMany returns all values as strings
    monthlyTotalsByCategory.forEach(
      (value) => (value.amount = parseFloat(value.amount)),
    );

    const totalsByGroup = groupBy(
      monthlyTotalsByCategory,
      (total) => total.recurringGroup,
    );

    // we want all budget groups present, even those for which the user may not have transactions
    const groups = (
      await Category.createQueryBuilder('category')
        .select('category.recurringGroup')
        .distinct(true)
        .getRawMany()
    ).map((category) => category.category_recurring_group);
    for (const group of groups) {
      totalsByGroup[group] = totalsByGroup[group] || [];
    }

    const groupEstimates = Object.entries(totalsByGroup).map(
      ([group, months]) => ({
        group: group,
        estimatedMonthlyAmount: this.trimmedMean(
          months.map((month) => month.amount),
        ),
      }),
    );

    return groupEstimates;
  }

  trimmedMean(values: number[]): number {
    if (!values.length) {
      return 0;
    } else if (values.length == 1) {
      return values[0];
    }

    const avg = mean(values);
    const deviations = values.map((value) => abs(value - avg));
    let maxDeviation = 0;
    let trimmedIndex = -1;
    for (let i = 0; i < deviations.length; i++) {
      const deviation = abs(deviations[i]);
      if (deviation > maxDeviation) {
        maxDeviation = deviation;
        trimmedIndex = i;
      }
    }
    const trimmedValues = values.splice(trimmedIndex, 1);
    return mean(trimmedValues);
  }
}
