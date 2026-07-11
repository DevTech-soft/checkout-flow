import { createHash } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { PaymentWebhookEventDto } from '@application/transaction/dto/payment-webhook-event.dto';
import { PaymentGatewayWebhookVerifier } from './payment-gateway-webhook.verifier';

describe('PaymentGatewayWebhookVerifier', () => {
  const eventsKey = 'test_events_secret';
  let verifier: PaymentGatewayWebhookVerifier;

  beforeEach(() => {
    const configService = {
      get: jest.fn(() => eventsKey),
    };
    verifier = new PaymentGatewayWebhookVerifier(
      configService as unknown as ConfigService,
    );
  });

  function buildEvent(overrides: Partial<PaymentWebhookEventDto> = {}) {
    const data = { transaction: { id: 'gw-1', status: 'APPROVED' } };
    const timestamp = 1700000000;
    const properties = ['transaction.id', 'transaction.status'];
    const checksum = createHash('sha256')
      .update(`gw-1APPROVED${timestamp}${eventsKey}`)
      .digest('hex');

    return {
      event: 'transaction.updated',
      data,
      signature: { properties, checksum },
      timestamp,
      ...overrides,
    };
  }

  it('accepts an event whose checksum matches the computed signature', () => {
    expect(verifier.verify(buildEvent())).toBe(true);
  });

  it('rejects an event with a tampered checksum', () => {
    const event = buildEvent();
    event.signature.checksum = 'tampered';

    expect(verifier.verify(event)).toBe(false);
  });

  it('rejects an event whose data was tampered after signing', () => {
    const event = buildEvent();
    event.data = { transaction: { id: 'gw-1', status: 'DECLINED' } };

    expect(verifier.verify(event)).toBe(false);
  });

  it('resolves a missing signed property to an empty string instead of throwing', () => {
    const timestamp = 1700000000;
    const checksum = createHash('sha256')
      .update(`${timestamp}${eventsKey}`)
      .digest('hex');
    const event = buildEvent({
      data: { transaction: { id: 'gw-1' } },
      signature: { properties: ['transaction.missing.deep'], checksum },
      timestamp,
    });

    expect(verifier.verify(event)).toBe(true);
  });
});
