import { Injectable } from '@nestjs/common';
import {
  CreatePaymentGatewayTransactionInput,
  PaymentGatewayPort,
  PaymentGatewayTransactionResult,
} from '@application/ports/payment-gateway.port';
import { PaymentGatewayClient } from './payment-gateway.client';

@Injectable()
export class PaymentGatewayAdapter implements PaymentGatewayPort {
  constructor(private readonly client: PaymentGatewayClient) {}

  async createTransaction(
    input: CreatePaymentGatewayTransactionInput,
  ): Promise<PaymentGatewayTransactionResult> {
    const acceptanceToken = await this.client.getAcceptanceToken();

    const transaction = await this.client.createTransaction({
      amount_in_cents: input.amountInCents,
      currency: input.currency,
      customer_email: input.customerEmail,
      reference: input.reference,
      acceptance_token: acceptanceToken,
      payment_method: {
        type: 'CARD',
        token: input.cardToken,
        installments: 1,
      },
    });

    return {
      gatewayTransactionId: transaction.id,
      status: transaction.status,
    };
  }

  async getTransactionStatus(gatewayTransactionId: string): Promise<string> {
    const transaction = await this.client.getTransaction(gatewayTransactionId);
    return transaction.status;
  }
}
