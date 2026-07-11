import Config from 'react-native-config';

export interface TokenizeCardInput {
  cardNumber: string;
  cvv: string;
  expiryDate: string;
  cardHolder: string;
}

interface WompiTokenizeCardResponse {
  status: string;
  data?: { id: string };
  error?: {
    reason?: string;
    messages?: Record<string, string[]>;
  };
}

export async function tokenizeCard(
  input: TokenizeCardInput,
): Promise<string> {
  const [expMonth, expYear] = input.expiryDate.split('/');

  let response: Response;
  try {
    response = await fetch(`${Config.WOMPI_BASE_URL}/tokens/cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Config.WOMPI_PUBLIC_KEY}`,
      },
      body: JSON.stringify({
        number: input.cardNumber.replace(/\s/g, ''),
        cvc: input.cvv,
        exp_month: expMonth,
        exp_year: expYear,
        card_holder: input.cardHolder,
      }),
    });
  } catch {
    throw new Error('No pudimos validar tu tarjeta. Intenta nuevamente.');
  }

  const body: WompiTokenizeCardResponse | undefined = await response
    .json()
    .catch(() => undefined);

  if (!response.ok || body?.status !== 'CREATED' || !body.data) {
    throw new Error(extractTokenizationError(body));
  }

  return body.data.id;
}

function extractTokenizationError(
  body: WompiTokenizeCardResponse | undefined,
): string {
  const messages = body?.error?.messages;
  if (messages) {
    return Object.values(messages).flat().join(' ');
  }
  if (body?.error?.reason) {
    return body.error.reason;
  }
  return 'No pudimos validar tu tarjeta. Verifica los datos e intenta de nuevo.';
}
