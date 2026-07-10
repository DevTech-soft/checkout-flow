export interface CreatePaymentGatewayTransactionInput {
  amountInCents: number;
  currency: string;
  cardToken: string;
  customerEmail: string;
  reference: string;
}

export interface PaymentGatewayTransactionResult {
  gatewayTransactionId: string;
  status: string;
}

export abstract class PaymentGatewayPort {
  abstract createTransaction(
    input: CreatePaymentGatewayTransactionInput,
  ): Promise<PaymentGatewayTransactionResult>;
}
