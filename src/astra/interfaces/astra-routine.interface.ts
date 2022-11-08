export enum Type {
  OneTime = 'one-time',
  Sweep = 'sweep',
}

export enum PreferredSettlementSpeed {
  T1 = 'T+1',
  T2 = 'T+2',
  T4 = 'T+4',
}

export enum Frequency {
  Weekly = 'weekly',
  BiWeekly = 'bi-weekly',
  Monthly = 'monthly',
}

// For more info: https://docs.astra.finance/#create-a-new-routine
export interface CreateAstraRoutine {
  type: Type;
  name: string;
  active: boolean;
  source_id: string;
  destination_id: string;
  destination_user_id: string;
  amount: number;
  start_date: string; // yyyy-LL-dd
  preferred_settlement_speed?: PreferredSettlementSpeed;
  frequency?: Frequency;
  min_balance?: number;
  spending?: string;
  amount_start?: number;
  amount_increment?: number;
  minimum_transaction_threshold?: number;
  percent_of_transaction?: number;
  percent_of_balance?: number;
}

export interface AstraRoutine extends CreateAstraRoutine {
  id: string;
}
