export type TransactionStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';

export interface CreateTransactionInput {
  productId: string;
  quantity: number;
  amountInCents: number;
  currency: string;
}

export interface TransactionResult {
  id: string;
  status: TransactionStatus;
  amountInCents: number;
  currency: string;
  productId: string;
  createdAt: string;
}
