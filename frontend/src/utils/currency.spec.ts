import { formatCurrency } from './currency';

describe('formatCurrency', () => {
  it('formats cents as whole currency units without decimals', () => {
    const formatted = formatCurrency(12000000, 'COP');

    expect(formatted).toContain('120.000');
  });

  it('divides amountInCents by 100 before formatting', () => {
    const formatted = formatCurrency(150000, 'COP');

    expect(formatted).toContain('1.500');
  });
});
