import {
  validateCardNumber,
  validateCvv,
  validateEmail,
  validateExpiryDate,
  validateFullName,
  validatePhoneNumber,
} from './validators';

describe('validateFullName', () => {
  it('rejects names shorter than 3 characters', () => {
    expect(validateFullName('Jo')).toBe('Ingresa el nombre completo');
  });

  it('accepts a valid name', () => {
    expect(validateFullName('Jane Doe')).toBeNull();
  });
});

describe('validateEmail', () => {
  it('rejects an invalid email', () => {
    expect(validateEmail('not-an-email')).toBe('Correo inválido');
  });

  it('accepts a valid email', () => {
    expect(validateEmail('jane@example.com')).toBeNull();
  });
});

describe('validatePhoneNumber', () => {
  it('rejects a phone number that is too short', () => {
    expect(validatePhoneNumber('123')).toBe('Teléfono inválido');
  });

  it('accepts a valid phone number', () => {
    expect(validatePhoneNumber('3001234567')).toBeNull();
  });
});

describe('validateCardNumber', () => {
  it('rejects non-numeric input', () => {
    expect(validateCardNumber('4242 42ab 4242 4242')).toBe(
      'El número de tarjeta solo debe contener dígitos',
    );
  });

  it('rejects a card number that fails the Luhn check', () => {
    expect(validateCardNumber('4242 4242 4242 4241')).toBe(
      'Número de tarjeta inválido',
    );
  });

  it('accepts a valid Visa sandbox card number', () => {
    expect(validateCardNumber('4242 4242 4242 4242')).toBeNull();
  });
});

describe('validateExpiryDate', () => {
  it('rejects a malformed date', () => {
    expect(validateExpiryDate('13/99')).toBe('Mes inválido');
  });

  it('rejects a date that does not match MM/YY', () => {
    expect(validateExpiryDate('1299')).toBe('Formato inválido (MM/YY)');
  });

  it('rejects an expired date', () => {
    expect(validateExpiryDate('01/20')).toBe('Tarjeta expirada');
  });

  it('accepts a future date', () => {
    expect(validateExpiryDate('12/99')).toBeNull();
  });
});

describe('validateCvv', () => {
  it('rejects a CVV with letters', () => {
    expect(validateCvv('12a')).toBe('CVV inválido');
  });

  it('accepts a 3-digit CVV', () => {
    expect(validateCvv('123')).toBeNull();
  });

  it('accepts a 4-digit CVV', () => {
    expect(validateCvv('1234')).toBeNull();
  });
});
