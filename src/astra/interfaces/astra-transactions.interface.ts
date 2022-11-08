export interface AstraTransaction {
  id: string;
  account_id: string;
  name: string;
  merchant_name: string;
  amount: number;
  date: string; // year-month-day (yyyy-LL-dd)
  category: string;
  category_id: string;
  location_address: string;
  location_city: string;
  location_state: string;
  location_store_number: string;
  location_zip: string;
  pending: boolean;
}

export interface AstraTransactions {
  cursor: string;
  more: boolean;
  transactions: AstraTransaction[];
}
