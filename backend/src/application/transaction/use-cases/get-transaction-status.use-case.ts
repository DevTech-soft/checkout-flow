import { TransactionResultDto } from '@application/transaction/dto/transaction-result.dto';

export abstract class GetTransactionStatusUseCase {
  abstract execute(transactionId: string): Promise<TransactionResultDto>;
}
