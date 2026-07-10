import { Injectable, NotFoundException } from '@nestjs/common';
import { TransactionRepository } from '@domain/transaction/repositories/transaction.repository';
import { TransactionResultDto } from '@application/transaction/dto/transaction-result.dto';
import { GetTransactionStatusUseCase } from '@application/transaction/use-cases/get-transaction-status.use-case';

@Injectable()
export class GetTransactionStatusService implements GetTransactionStatusUseCase {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async execute(transactionId: string): Promise<TransactionResultDto> {
    const transaction =
      await this.transactionRepository.findById(transactionId);
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
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
