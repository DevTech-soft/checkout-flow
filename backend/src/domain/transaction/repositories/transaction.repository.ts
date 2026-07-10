import { Transaction } from '@domain/transaction/entities/transaction.entity';
import { TransactionStatus } from '@domain/transaction/transaction-status.enum';

export abstract class TransactionRepository {
  abstract create(transaction: Transaction): Promise<Transaction>;
  abstract updateStatus(
    id: string,
    status: TransactionStatus,
    gatewayTransactionId?: string,
  ): Promise<Transaction>;
  abstract findById(id: string): Promise<Transaction | null>;
}
