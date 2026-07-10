import { TransactionStatus } from '@domain/transaction/transaction-status.enum';

export class TransactionResultDto {
  id!: string;
  status!: TransactionStatus;
  amountInCents!: number;
  currency!: string;
  productId!: string;
  createdAt!: Date;
}
