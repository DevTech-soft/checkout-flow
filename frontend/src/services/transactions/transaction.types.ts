export type TransactionStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';

export interface TransactionLineItem {
  productId: string;
  quantity: number;
}

export interface CreateTransactionInput {
  items: TransactionLineItem[];
  cardToken: string;
  fullName: string;
  email: string;
  phoneNumber: string;
}

export interface TransactionResultItem {
  productId: string;
  quantity: number;
  unitPriceInCents: number;
}

export interface TransactionResult {
  id: string;
  status: TransactionStatus;
  amountInCents: number;
  currency: string;
  items: TransactionResultItem[];
  createdAt: string;
}
