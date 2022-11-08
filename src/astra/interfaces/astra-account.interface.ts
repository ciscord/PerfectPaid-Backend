export interface AstraAccount {
  id: string;
  official_name: string;
  name: string;
  nickname: string;
  mask: string;
  institution_name: string;
  institution_logo: string;
  type: string;
  subtype: string;
  current_balance: number;
  available_balance: number;
  last_balance_update_on: string;
  connection_status: string;
}
