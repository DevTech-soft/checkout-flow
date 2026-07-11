import { Injectable, NotFoundException } from '@nestjs/common';
import { TransactionRepository } from '@domain/transaction/repositories/transaction.repository';
import { TransactionStatus } from '@domain/transaction/transaction-status.enum';
import { PaymentGatewayPort } from '@application/ports/payment-gateway.port';
import { TransactionResultDto } from '@application/transaction/dto/transaction-result.dto';
import { GetTransactionStatusUseCase } from '@application/transaction/use-cases/get-transaction-status.use-case';
import { mapGatewayStatus } from '@application/transaction/mappers/gateway-status.mapper';

@Injectable()
export class GetTransactionStatusService implements GetTransactionStatusUseCase {
  constructor(
    private readonly transactionRepository: TransactionRepository,
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
          transaction = await this.transactionRepository.updateStatus(
            transaction.id,
            status,
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
      productId: transaction.productId,
      createdAt: transaction.createdAt,
    };
  }
}
