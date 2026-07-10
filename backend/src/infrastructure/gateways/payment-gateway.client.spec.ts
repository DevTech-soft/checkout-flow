import { of } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { PaymentGatewayClient } from './payment-gateway.client';

describe('PaymentGatewayClient', () => {
  let client: PaymentGatewayClient;
  let httpService: { get: jest.Mock; post: jest.Mock };

  beforeEach(() => {
    httpService = { get: jest.fn(), post: jest.fn() };
    const values: Record<string, string> = {
      'paymentGateway.baseUrl': 'https://sandbox.example.com/v1',
      'paymentGateway.publicKey': 'pub_test_123',
      'paymentGateway.privateKey': 'prv_test_123',
    };
    const configService = { get: jest.fn((key: string) => values[key]) };

    client = new PaymentGatewayClient(
      httpService as unknown as HttpService,
      configService as unknown as ConfigService,
    );
  });

  it('fetches the acceptance token from the merchant endpoint', async () => {
    httpService.get.mockReturnValue(
      of({
        data: {
          data: { presigned_acceptance: { acceptance_token: 'tok' } },
        },
      } as AxiosResponse),
    );

    await expect(client.getAcceptanceToken()).resolves.toBe('tok');
    expect(httpService.get).toHaveBeenCalledWith(
      'https://sandbox.example.com/v1/merchants/pub_test_123',
    );
  });

  it('creates a transaction against the gateway with the private key', async () => {
    httpService.post.mockReturnValue(
      of({
        data: { data: { id: 'gw-1', status: 'APPROVED' } },
      } as AxiosResponse),
    );

    const payload = {
      amount_in_cents: 10000,
      currency: 'COP',
      customer_email: 'jane@example.com',
      reference: 'tx-1',
      acceptance_token: 'tok',
      payment_method: {
        type: 'CARD' as const,
        token: 'tok_test',
        installments: 1,
      },
    };

    await expect(client.createTransaction(payload)).resolves.toEqual({
      id: 'gw-1',
      status: 'APPROVED',
    });
    expect(httpService.post).toHaveBeenCalledWith(
      'https://sandbox.example.com/v1/transactions',
      payload,
      { headers: { Authorization: 'Bearer prv_test_123' } },
    );
  });
});
