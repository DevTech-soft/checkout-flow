import { TransactionStatus } from '@domain/transaction/transaction-status.enum';

export class TransactionResultItemDto {
  productId!: string;
  quantity!: number;
  unitPriceInCents!: number;
}

export class TransactionResultDto {
  id!: string;
  status!: TransactionStatus;
  amountInCents!: number;
  currency!: string;
  items!: TransactionResultItemDto[];
  createdAt!: Date;
}
