import { httpClient } from '@services/api/httpClient';
import type {
  CreateTransactionInput,
  TransactionResult,
} from './transaction.types';

const POLL_INITIAL_DELAY_MS = 1500;
const POLL_MAX_DELAY_MS = 8000;
const POLL_MAX_ATTEMPTS = 8;

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function pollTransactionStatus(id: string): Promise<TransactionResult> {
  let delay = POLL_INITIAL_DELAY_MS;

  for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt += 1) {
    await sleep(delay);

    const result = await httpClient.get<TransactionResult>(
      `/transactions/${id}`,
    );
    if (result.status !== 'PENDING') {
      return result;
    }

    delay = Math.min(delay * 1.5, POLL_MAX_DELAY_MS);
  }

  throw new Error(
    'Tu pago sigue en proceso. Te notificaremos cuando se confirme.',
  );
}

export async function createTransaction(
  input: CreateTransactionInput,
): Promise<TransactionResult> {
  const result = await httpClient.post<TransactionResult>('/transactions', {
    items: input.items,
    cardToken: input.cardToken,
    fullName: input.fullName,
    email: input.email,
    phoneNumber: input.phoneNumber,
  });

  if (result.status !== 'PENDING') {
    return result;
  }

  return pollTransactionStatus(result.id);
}
