import { AstraAccount } from './interfaces/astra-account.interface';
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { AstraTransactions } from './interfaces/astra-transactions.interface';
import { BadRequestException, Logger } from '@nestjs/common';
import { CreateUserIntentDto } from './dto/create-user-intent.dto';
import { AstraUser } from './interfaces/astra-user.interface';
import { GetTokenResponse } from './interfaces/get-token-response.interface';
import {
  AstraRoutine,
  CreateAstraRoutine,
} from './interfaces/astra-routine.interface';
import { AstraListAccountsResponse } from './interfaces/astra-list-accounts-response.interface';
import { isString } from 'lodash';

export class AstraClient {
  private axiosInstance: AxiosInstance;
  private readonly logger = new Logger(AstraClient.name);

  constructor(accessToken: string) {
    this.axiosInstance = axios.create({
      baseURL: process.env.ASTRA_API_URL,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const logger = this.logger;
    this.axiosInstance.interceptors.response.use(
      function (response) {
        return response;
      },
      function (error: AxiosError) {
        logger.error('Astra API error', JSON.stringify(error.response.data));
        return Promise.reject(error);
      },
    );
  }

  async getAccounts(): Promise<AstraAccount[]> {
    const response = await this.axiosInstance.get<AstraListAccountsResponse>(
      '/accounts',
    );
    return response.data.accounts || [];
  }

  async getAccountById(accountId: string): Promise<AstraAccount> {
    const response = await this.axiosInstance.get(`/accounts/${accountId}`);
    return response.data;
  }

  async getTransactions(
    accountId: string,
    startDate: string,
    endDate: string,
    cursor?: string,
  ): Promise<AstraTransactions> {
    const params = {
      account_id: accountId,
      date_start: startDate,
      date_end: endDate,
      batch_size: 100,
    };

    if (cursor) {
      params['cursor'] = cursor;
    }

    const response = await this.axiosInstance.get('/transactions', {
      params,
    });
    return response.data;
  }

  static async createUserIntent(
    userData: CreateUserIntentDto,
  ): Promise<string> {
    let response: AxiosResponse<any>;

    // Does not use axios instance because it needs its own auth
    try {
      response = await axios.post(
        `${process.env.ASTRA_API_URL}/user_intent`,
        userData,
        {
          auth: {
            username: process.env.ASTRA_CLIENT_ID,
            password: process.env.ASTRA_CLIENT_SECRET,
          },
        },
      );
    } catch (e) {
      let message = '';
      const description = e.response.data.description;

      if (isString(description)) {
        message = description;
      } else {
        const errorKeys = Object.keys(description);
        description[errorKeys[0]];
      }

      // We send this error back to the user because Astra validates the user data
      // This is one of the few API where pass through data from the user
      throw new BadRequestException(message);
    }

    return response.data.id;
  }

  async createRoutine(
    createAstraRoutine: CreateAstraRoutine,
  ): Promise<AstraRoutine> {
    const response = await this.axiosInstance.post(
      '/routines',
      createAstraRoutine,
    );
    return response.data;
  }

  async getUser(): Promise<AstraUser> {
    const response = await this.axiosInstance.get('/user');
    return response.data;
  }

  static async getAccessToken(
    code: string,
    granType: string,
    redirectUri: string,
  ): Promise<GetTokenResponse> {
    const codeType = granType === 'refresh_token' ? 'refresh_token' : 'code';
    const bodyData = new URLSearchParams();
    bodyData.append('grant_type', granType);
    bodyData.append(codeType, code);
    bodyData.append('redirect_uri', redirectUri);

    // Does not use axios instance because it needs its own auth
    const response = await axios.post(
      `${process.env.ASTRA_API_URL}/oauth/token`,
      bodyData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: {
          username: process.env.ASTRA_CLIENT_ID,
          password: process.env.ASTRA_CLIENT_SECRET,
        },
      },
    );

    if (response.data.error) {
      throw new BadRequestException(`Astra error: ${response.data.error}`);
    }

    return response.data;
  }
}
