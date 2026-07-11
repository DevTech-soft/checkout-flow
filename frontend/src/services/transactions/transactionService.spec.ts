jest.mock('@services/api/httpClient', () => ({
  httpClient: { get: jest.fn(), post: jest.fn() },
}));

import { httpClient } from '@services/api/httpClient';
import { createTransaction } from './transactionService';
import type { CreateTransactionInput } from './transaction.types';

const mockedHttpClient = httpClient as jest.Mocked<typeof httpClient>;

const input: CreateTransactionInput = {
  items: [{ productId: '1', quantity: 2 }],
  cardToken: 'tok_test_123',
  fullName: 'Jane Doe',
  email: 'jane@example.com',
  phoneNumber: '3001234567',
};

const approvedResult = {
  id: 'tx-1',
  status: 'APPROVED' as const,
  amountInCents: 24000000,
  currency: 'COP',
  items: [{ productId: '1', quantity: 2, unitPriceInCents: 12000000 }],
  createdAt: '2026-07-10T00:00:00.000Z',
};

describe('transactionService', () => {
  beforeEach(() => {
    mockedHttpClient.post.mockReset();
    mockedHttpClient.get.mockReset();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('posts the transaction to the backend and returns the result when it resolves immediately', async () => {
    mockedHttpClient.post.mockResolvedValue(approvedResult);

    const result = await createTransaction(input);

    expect(mockedHttpClient.post).toHaveBeenCalledWith('/transactions', {
      items: [{ productId: '1', quantity: 2 }],
      cardToken: 'tok_test_123',
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      phoneNumber: '3001234567',
    });
    expect(result).toEqual(approvedResult);
    expect(mockedHttpClient.get).not.toHaveBeenCalled();
  });

  it('polls the backend until the transaction leaves the PENDING status', async () => {
    mockedHttpClient.post.mockResolvedValue({
      ...approvedResult,
      status: 'PENDING',
    });
    mockedHttpClient.get
      .mockResolvedValueOnce({ ...approvedResult, status: 'PENDING' })
      .mockResolvedValueOnce(approvedResult);

    const resultPromise = createTransaction(input);

    await jest.advanceTimersByTimeAsync(1500);
    await jest.advanceTimersByTimeAsync(2250);

    const result = await resultPromise;

    expect(mockedHttpClient.get).toHaveBeenCalledTimes(2);
    expect(mockedHttpClient.get).toHaveBeenCalledWith('/transactions/tx-1');
    expect(result).toEqual(approvedResult);
  });

  it('throws when the transaction stays PENDING after the max poll attempts', async () => {
    mockedHttpClient.post.mockResolvedValue({
      ...approvedResult,
      status: 'PENDING',
    });
    mockedHttpClient.get.mockResolvedValue({
      ...approvedResult,
      status: 'PENDING',
    });

    const resultPromise = createTransaction(input);

    await Promise.all([
      expect(resultPromise).rejects.toThrow(
        'Tu pago sigue en proceso. Te notificaremos cuando se confirme.',
      ),
      jest.advanceTimersByTimeAsync(60000),
    ]);
  });
});
