import { ExpenseCategory } from 'src/transactions/interfaces/expense-category.interface';

export const expenseCategories: ExpenseCategory[] = [
  {
    id: 'savings',
    label: 'Savings',
    where: {
      subCat_4: 'Savings',
    },
  },
  {
    id: 'auto_and_transportation',
    label: 'Auto & Transportation',
    where: {
      subCat_2: 'Transportation',
    },
  },
  {
    id: 'dining_and_drinks',
    label: 'Dining & Drinks',
    where: {
      subCat_4: 'Restaurants & Bars',
    },
  },
  {
    id: 'groceries',
    label: 'Groceries',
    where: {
      subCat_4: 'Groceries',
    },
  },
  {
    id: 'healthcare',
    label: 'Healthcare',
    where: {
      subCat_3: 'Healthcare',
    },
  },
  {
    id: 'entertainment',
    label: 'Entertainment',
    where: {
      subCat_3: 'Entertainment',
    },
  },
];
