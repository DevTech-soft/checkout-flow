import { ProductRepository } from '@domain/product/repositories/product.repository';
import { Transaction } from '@domain/transaction/entities/transaction.entity';
import { TransactionStatus } from '@domain/transaction/transaction-status.enum';

export async function decrementStockForApprovedTransaction(
  productRepository: ProductRepository,
  transaction: Transaction,
  previousStatus: TransactionStatus,
): Promise<void> {
  if (
    transaction.status !== TransactionStatus.APPROVED ||
    previousStatus === TransactionStatus.APPROVED
  ) {
    return;
  }

  for (const item of transaction.items) {
    await productRepository.decrementStock(item.productId, item.quantity);
  }
}
