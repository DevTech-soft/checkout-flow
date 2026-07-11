import { PaymentWebhookEventDto } from '@application/transaction/dto/payment-webhook-event.dto';

export abstract class HandlePaymentWebhookUseCase {
  abstract execute(event: PaymentWebhookEventDto): Promise<void>;
}
