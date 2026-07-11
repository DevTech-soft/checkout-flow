import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TransactionRepository } from '@domain/transaction/repositories/transaction.repository';
import { PaymentGatewayWebhookVerifier } from '@infrastructure/gateways/payment-gateway-webhook.verifier';
import { PaymentWebhookEventDto } from '@application/transaction/dto/payment-webhook-event.dto';
import { mapGatewayStatus } from '@application/transaction/mappers/gateway-status.mapper';
import { HandlePaymentWebhookUseCase } from '@application/transaction/use-cases/handle-payment-webhook.use-case';

const TRANSACTION_UPDATED_EVENT = 'transaction.updated';

@Injectable()
export class HandlePaymentWebhookService
  implements HandlePaymentWebhookUseCase
{
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly verifier: PaymentGatewayWebhookVerifier,
  ) {}

  async execute(event: PaymentWebhookEventDto): Promise<void> {
    if (!this.verifier.verify(event)) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    if (event.event !== TRANSACTION_UPDATED_EVENT) {
      return;
    }

    const gatewayTransaction = event.data.transaction as
      | { id?: string; status?: string }
      | undefined;
    if (!gatewayTransaction?.id) {
      return;
    }

    const transaction =
      await this.transactionRepository.findByGatewayTransactionId(
        gatewayTransaction.id,
      );
    if (!transaction) {
      return;
    }

    await this.transactionRepository.updateStatus(
      transaction.id,
      mapGatewayStatus(gatewayTransaction.status),
    );
  }
}
