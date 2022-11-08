import { AstraAccount } from './astra-account.interface';

export interface AstraListAccountsResponse {
  count: number;
  accounts?: AstraAccount[];
}
