import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { generatorUserSeed } from './data/user.seed';
import { categoryList } from './data/category.seed';
import { seriesList } from './data/transaction-series.seed';
import { getTransList } from './data/categorized-transaction.seed';
import { Auth0Service } from '../common/services/auth0.service';
import { Category } from '../transactions/entities/category.entity';
import { TransactionSeries } from '../transactions/entities/transaction-series.entity';
import { User } from '../users/entities/user.entity';
import { CategorizedTransaction } from '../transactions/entities/categorized-transaction.entity';
import { AstraClient } from 'src/astra/astra-api-client';

@Injectable()
export class SeedService {
  constructor(
    private usersService: UsersService,
    private readonly auth0Service: Auth0Service,
  ) {}

  async createUser() {
    const userSeed = generatorUserSeed(3);
    const password = 'Aasd123!@#';

    for (const user of userSeed) {
      const email = user.email;
      const authUserData = await this.auth0Service.signUp(email, password);
      const astraUserIntentId = await AstraClient.createUserIntent({
        email,
        phone: user.phone,
        first_name: user.firstName,
        last_name: user.lastName,
        address1: user.address1,
        address2: user.address2,
        city: user.city,
        state: user.state,
        postal_code: user.postalCode,
        date_of_birth: user.dob,
        ssn: user.ssn,
        ip_address: '127.0.0.1',
      });
      await this.usersService.createOrUpdate(
        `auth0|${authUserData.data._id}`,
        astraUserIntentId,
        user,
      );
      console.log(`Added ${email}`);
    }
  }

  //Category
  async createCategory() {
    for (const category of categoryList) {
      const categoryRep = new Category();
      categoryRep.id = category.id;
      categoryRep.subCat_1 = category.subCat_1;
      categoryRep.subCat_2 = category.subCat_2;
      categoryRep.subCat_3 = category.subCat_3;
      categoryRep.subCat_4 = category.subCat_4;
      categoryRep.weight = category.weight;
      await categoryRep.save();
    }
  }

  //Transaction Series
  async createTransactionSerious() {
    const user = await User.find();
    for (const series of seriesList) {
      const tranSeries = new TransactionSeries();
      tranSeries.user = user[0];
      tranSeries.seriesName = series.seriesName;
      tranSeries.isIncome = series.isIncome;
      tranSeries.isRecurring = series.isRecurring;
      tranSeries.isSplit = series.isSplit;
      tranSeries.recurringScore = series.recurringScore;
      tranSeries.recurringConfidence = series.recurringConfidence;
      tranSeries.frequency = series.frequency;
      await tranSeries.save();
    }
  }

  //Categorized Transaction
  async createTransaction() {
    const user = await User.find();
    const transList = getTransList(30);
    for (const trans of transList) {
      const transSeries = await TransactionSeries.findOne({
        frequency: trans.frequency,
      });
      const category = await Category.findOne({ subCat_1: trans.subCategory });
      const transRep = new CategorizedTransaction();
      transRep.plaidTransactionId = trans.plaidTransactionId;
      transRep.user = user[0];
      transRep.transactionSeries = transSeries;
      transRep.category = category;
      transRep.xferType = trans.xferType;
      transRep.txCity = trans.txCity;
      transRep.txRegion = trans.txRegion;
      transRep.txPostalCode = trans.txPostalCode;
      transRep.isWp = trans.isWp;
      transRep.isPending = trans.isPending;
      transRep.isSelfSend = trans.isSelfSend;
      transRep.transactionDescription = trans.transactionDescription;
      transRep.payee = trans.payee;
      transRep.paymentMethod = trans.paymentMethod;
      transRep.reason = trans.reason;
      transRep.isoCurrencyCode = trans.isoCurrencyCode;
      transRep.amount = parseFloat(trans.amount);
      transRep.createDate = trans.createDate;
      await transRep.save();
    }
  }
}
