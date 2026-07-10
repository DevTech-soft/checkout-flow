const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidLuhn(digits: string): boolean {
  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

export function validateFullName(value: string): string | null {
  if (value.trim().length < 3) {
    return 'Ingresa el nombre completo';
  }
  return null;
}

export function validateEmail(value: string): string | null {
  if (!EMAIL_REGEX.test(value)) {
    return 'Correo inválido';
  }
  return null;
}

export function validatePhoneNumber(value: string): string | null {
  const digits = value.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) {
    return 'Teléfono inválido';
  }
  return null;
}

export function validateCardNumber(value: string): string | null {
  const digits = value.replace(/\s/g, '');
  if (!/^\d+$/.test(digits)) {
    return 'El número de tarjeta solo debe contener dígitos';
  }
  if (digits.length < 13 || digits.length > 19) {
    return 'Número de tarjeta inválido';
  }
  if (!isValidLuhn(digits)) {
    return 'Número de tarjeta inválido';
  }
  return null;
}

export function validateExpiryDate(value: string): string | null {
  const match = /^(\d{2})\/(\d{2})$/.exec(value);
  if (!match) {
    return 'Formato inválido (MM/YY)';
  }

  const month = Number(match[1]);
  const year = Number(match[2]) + 2000;
  if (month < 1 || month > 12) {
    return 'Mes inválido';
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return 'Tarjeta expirada';
  }

  return null;
}

export function validateCvv(value: string): string | null {
  if (!/^\d{3,4}$/.test(value)) {
    return 'CVV inválido';
  }
  return null;
}
