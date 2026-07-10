import { Module } from '@nestjs/common';
import { PaymentGatewayModule } from '@infrastructure/gateways/payment-gateway.module';
import { CreateTransactionUseCase } from '@application/transaction/use-cases/create-transaction.use-case';
import { CreateTransactionService } from '@application/transaction/use-cases/create-transaction.service';
import { GetTransactionStatusUseCase } from '@application/transaction/use-cases/get-transaction-status.use-case';
import { GetTransactionStatusService } from '@application/transaction/use-cases/get-transaction-status.service';
import { TransactionController } from './transaction.controller';

@Module({
  imports: [PaymentGatewayModule],
  controllers: [TransactionController],
  providers: [
    { provide: CreateTransactionUseCase, useClass: CreateTransactionService },
    {
      provide: GetTransactionStatusUseCase,
      useClass: GetTransactionStatusService,
    },
  ],
})
export class TransactionModule {}
