import { createHash } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentWebhookEventDto } from '@application/transaction/dto/payment-webhook-event.dto';

@Injectable()
export class PaymentGatewayWebhookVerifier {
  constructor(private readonly configService: ConfigService) {}

  private get eventsKey(): string {
    return this.configService.get<string>('paymentGateway.eventsKey')!;
  }

  verify(event: PaymentWebhookEventDto): boolean {
    const concatenatedProperties = event.signature.properties
      .map(path => resolvePath(event.data, path))
      .join('');

    const expectedChecksum = createHash('sha256')
      .update(`${concatenatedProperties}${event.timestamp}${this.eventsKey}`)
      .digest('hex');

    return expectedChecksum === event.signature.checksum;
  }
}

function resolvePath(source: Record<string, unknown>, path: string): string {
  const value = path
    .split('.')
    .reduce<unknown>(
      (current, key) =>
        current && typeof current === 'object'
          ? (current as Record<string, unknown>)[key]
          : undefined,
      source,
    );

  return value === undefined || value === null ? '' : String(value);
}
