export interface PaymentMeta {
  reference_number: string;
  ppd_id: string;
  payee: string;
  by_order_of: string;
  payer: string;
  payment_method: string;
  payment_processor: string;
  reason: string;
}
