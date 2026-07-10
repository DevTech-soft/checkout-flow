import { formatCardNumber, formatExpiryDate } from './cardFormat';

describe('formatCardNumber', () => {
  it('groups digits in blocks of 4', () => {
    expect(formatCardNumber('4242424242424242')).toBe('4242 4242 4242 4242');
  });

  it('strips non-digit characters', () => {
    expect(formatCardNumber('4242-4242-4242-4242')).toBe('4242 4242 4242 4242');
  });

  it('truncates beyond 19 digits', () => {
    expect(formatCardNumber('123456789012345678901')).toBe(
      '1234 5678 9012 3456 789',
    );
  });
});

describe('formatExpiryDate', () => {
  it('does not insert a slash before the month is complete', () => {
    expect(formatExpiryDate('1')).toBe('1');
  });

  it('inserts a slash after the month', () => {
    expect(formatExpiryDate('1299')).toBe('12/99');
  });

  it('strips non-digit characters', () => {
    expect(formatExpiryDate('12/99')).toBe('12/99');
  });
});
