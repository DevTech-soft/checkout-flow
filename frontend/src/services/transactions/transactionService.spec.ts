import { createTransaction } from './transactionService';
import type { CreateTransactionInput } from './transaction.types';

const input: CreateTransactionInput = {
  productId: '1',
  quantity: 2,
  amountInCents: 24000000,
  currency: 'COP',
};

describe('transactionService', () => {
  it('resolves an approved transaction for the given input', async () => {
    const result = await createTransaction(input);

    expect(result.status).toBe('APPROVED');
    expect(result.amountInCents).toBe(input.amountInCents);
    expect(result.currency).toBe(input.currency);
    expect(result.productId).toBe(input.productId);
    expect(typeof result.id).toBe('string');
    expect(result.id.length).toBeGreaterThan(0);
    expect(() => new Date(result.createdAt).toISOString()).not.toThrow();
  });

  it('generates a unique id per transaction', async () => {
    const first = await createTransaction(input);
    const second = await createTransaction(input);

    expect(first.id).not.toBe(second.id);
  });
});
