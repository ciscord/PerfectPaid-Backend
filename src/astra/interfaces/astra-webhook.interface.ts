export interface AstraWebHook {
  webhook_type: string;
  webhook_id: string;
  user_id: string;
  resource_id: string;
  removed_transactions?: string[];
}

export interface astraTransaction {
  account_id: string;
  amount: number;
  category: string;
  date: string;
  id: string;
  name: string;
  pending: boolean;
}
