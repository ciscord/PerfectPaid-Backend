export enum Type {
  SplitBill = 'split_bill',
  RecurringTransfer = 'recurring_transfer',
}

export interface SQSMessage {
  type: Type;
}

export interface SQSMessageSplitBill extends SQSMessage {
  transactionSeriesId: string;
  categorizedTransactionId: string;
}

export interface SQSMessageCreateTransfer extends SQSMessage {
  recurringTransferId: number;
}
