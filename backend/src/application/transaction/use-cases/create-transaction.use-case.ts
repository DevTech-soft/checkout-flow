import { CreateTransactionDto } from '@application/transaction/dto/create-transaction.dto';
import { TransactionResultDto } from '@application/transaction/dto/transaction-result.dto';

export abstract class CreateTransactionUseCase {
  abstract execute(input: CreateTransactionDto): Promise<TransactionResultDto>;
}
