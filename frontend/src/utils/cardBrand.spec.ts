import { detectCardBrand } from './cardBrand';

describe('detectCardBrand', () => {
  it('detects Visa cards', () => {
    expect(detectCardBrand('4242 4242 4242 4242')).toBe('VISA');
  });

  it('detects Mastercard cards in the 51-55 range', () => {
    expect(detectCardBrand('5555 5555 5555 4444')).toBe('MASTERCARD');
  });

  it('detects Mastercard cards in the 2221-2720 range', () => {
    expect(detectCardBrand('2223 0000 0000 0000')).toBe('MASTERCARD');
  });

  it('returns UNKNOWN for unrecognized prefixes', () => {
    expect(detectCardBrand('6011 0000 0000 0000')).toBe('UNKNOWN');
  });

  it('returns UNKNOWN for empty input', () => {
    expect(detectCardBrand('')).toBe('UNKNOWN');
  });
});
