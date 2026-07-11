import { Money } from './money.vo';

describe('Money', () => {
  it('creates a Money instance from a non-negative integer amount', () => {
    const money = Money.fromCents(10000, 'COP');

    expect(money.amountInCents).toBe(10000);
    expect(money.currency).toBe('COP');
  });

  it('throws when the amount is not an integer', () => {
    expect(() => Money.fromCents(100.5, 'COP')).toThrow(
      'amountInCents must be a non-negative integer',
    );
  });

  it('throws when the amount is negative', () => {
    expect(() => Money.fromCents(-1, 'COP')).toThrow(
      'amountInCents must be a non-negative integer',
    );
  });

  it('throws when the currency is missing', () => {
    expect(() => Money.fromCents(10000, '')).toThrow('currency is required');
  });
});
