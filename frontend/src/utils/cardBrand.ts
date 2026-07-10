export type CardBrand = 'VISA' | 'MASTERCARD' | 'UNKNOWN';

export function detectCardBrand(cardNumber: string): CardBrand {
  const digits = cardNumber.replace(/\s/g, '');

  if (digits.startsWith('4')) {
    return 'VISA';
  }

  const prefix2 = Number(digits.slice(0, 2));
  const prefix4 = Number(digits.slice(0, 4));
  if ((prefix2 >= 51 && prefix2 <= 55) || (prefix4 >= 2221 && prefix4 <= 2720)) {
    return 'MASTERCARD';
  }

  return 'UNKNOWN';
}
