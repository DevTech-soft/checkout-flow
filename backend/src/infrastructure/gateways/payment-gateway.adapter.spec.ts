import { PaymentGatewayAdapter } from './payment-gateway.adapter';
import { PaymentGatewayClient } from './payment-gateway.client';

describe('PaymentGatewayAdapter', () => {
  let adapter: PaymentGatewayAdapter;
  let client: {
    getAcceptanceToken: jest.Mock;
    createTransaction: jest.Mock;
    getTransaction: jest.Mock;
  };

  beforeEach(() => {
    client = {
      getAcceptanceToken: jest.fn().mockResolvedValue('acceptance-token'),
      createTransaction: jest
        .fn()
        .mockResolvedValue({ id: 'gw-tx-1', status: 'APPROVED' }),
      getTransaction: jest
        .fn()
        .mockResolvedValue({ id: 'gw-tx-1', status: 'APPROVED' }),
    };
    adapter = new PaymentGatewayAdapter(
      client as unknown as PaymentGatewayClient,
    );
  });

  it('creates a transaction using a freshly fetched acceptance token', async () => {
    const result = await adapter.createTransaction({
      amountInCents: 10000,
      currency: 'COP',
      cardToken: 'tok_test_123',
      customerEmail: 'jane@example.com',
      reference: 'tx-1',
    });

    expect(client.getAcceptanceToken).toHaveBeenCalled();
    expect(client.createTransaction).toHaveBeenCalledWith({
      amount_in_cents: 10000,
      currency: 'COP',
      customer_email: 'jane@example.com',
      reference: 'tx-1',
      acceptance_token: 'acceptance-token',
      payment_method: {
        type: 'CARD',
        token: 'tok_test_123',
        installments: 1,
      },
    });
    expect(result).toEqual({
      gatewayTransactionId: 'gw-tx-1',
      status: 'APPROVED',
    });
  });

  it('returns the current status for a gateway transaction id', async () => {
    await expect(
      adapter.getTransactionStatus('gw-tx-1'),
    ).resolves.toBe('APPROVED');
    expect(client.getTransaction).toHaveBeenCalledWith('gw-tx-1');
  });
});
