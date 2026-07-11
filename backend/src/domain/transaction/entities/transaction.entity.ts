import { Money } from '@domain/shared/value-objects/money.vo';
import { TransactionItem } from '@domain/transaction/entities/transaction-item.entity';
import { TransactionStatus } from '@domain/transaction/transaction-status.enum';

export class Transaction {
  constructor(
    public readonly id: string,
    public readonly status: TransactionStatus,
    public readonly amount: Money,
    public readonly items: TransactionItem[],
    public readonly customerId: string,
    public readonly gatewayTransactionId: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
