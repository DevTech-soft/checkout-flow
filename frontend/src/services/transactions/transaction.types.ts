export type TransactionStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';

export interface CreateTransactionInput {
  productId: string;
  quantity: number;
  cardToken: string;
  fullName: string;
  email: string;
  phoneNumber: string;
}

export interface TransactionResult {
  id: string;
  status: TransactionStatus;
  amountInCents: number;
  currency: string;
  productId: string;
  createdAt: string;
}
