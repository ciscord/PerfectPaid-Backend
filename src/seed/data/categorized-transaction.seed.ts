import * as faker from 'faker';
import { frequency, subCategory } from './data';
faker.setLocale('en_US');

export const getTransList = (count: number) => {
  let transList = [];
  for (let i = 0; i < count; i++) {
    const trans = {
      plaidTransactionId: '',
      xferType: `xfer${i}`,
      txCity: faker.address.city(),
      txRegion: faker.address.state(),
      txPostalCode: faker.address.zipCode(),
      accId: faker.finance.account(),
      accountType: faker.finance.routingNumber(),
      isWp: true,
      isPending: false,
      isSelfSend: true,
      txSubcategory: faker.finance.transactionType(),
      transactionDescription: faker.finance.transactionDescription(),
      payee: '',
      paymentMethod: faker.finance.transactionType(),
      reason: '',
      isoCurrencyCode: faker.finance.currencySymbol(),
      amount: faker.finance.amount(),
      frequency: frequency[i % 3],
      subCategory: subCategory[i % 3],
      createDate: new Date(),
    };
    transList.push(trans);
  }
  return transList;
};
