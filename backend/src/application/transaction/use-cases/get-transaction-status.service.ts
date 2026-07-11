import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository } from '@domain/product/repositories/product.repository';
import { TransactionRepository } from '@domain/transaction/repositories/transaction.repository';
import { TransactionStatus } from '@domain/transaction/transaction-status.enum';
import { PaymentGatewayPort } from '@application/ports/payment-gateway.port';
import { TransactionResultDto } from '@application/transaction/dto/transaction-result.dto';
import { GetTransactionStatusUseCase } from '@application/transaction/use-cases/get-transaction-status.use-case';
import { mapGatewayStatus } from '@application/transaction/mappers/gateway-status.mapper';
import { decrementStockForApprovedTransaction } from '@application/transaction/decrement-stock-for-approved-transaction';

@Injectable()
export class GetTransactionStatusService implements GetTransactionStatusUseCase {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly productRepository: ProductRepository,
    private readonly paymentGateway: PaymentGatewayPort,
  ) {}

  async execute(transactionId: string): Promise<TransactionResultDto> {
    let transaction = await this.transactionRepository.findById(transactionId);
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (
      transaction.status === TransactionStatus.PENDING &&
      transaction.gatewayTransactionId
    ) {
      try {
        const gatewayStatus = await this.paymentGateway.getTransactionStatus(
          transaction.gatewayTransactionId,
        );
        const status = mapGatewayStatus(gatewayStatus);
        if (status !== TransactionStatus.PENDING) {
          const previousStatus = transaction.status;
          transaction = await this.transactionRepository.updateStatus(
            transaction.id,
            status,
          );
          await decrementStockForApprovedTransaction(
            this.productRepository,
            transaction,
            previousStatus,
          );
        }
      } catch {
        // pago inalcansable, no actualizamos el estatus.
      }
    }

    return {
      id: transaction.id,
      status: transaction.status,
      amountInCents: transaction.amount.amountInCents,
      currency: transaction.amount.currency,
      items: transaction.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPriceInCents: item.unitPriceInCents,
      })),
      createdAt: transaction.createdAt,
    };
  }
}
