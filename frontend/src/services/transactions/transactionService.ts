import CryptoJS from 'crypto-js';
import type {
  CreateTransactionInput,
  TransactionResult,
} from './transaction.types';

const SIMULATED_DELAY_MS = 800;

function generateTransactionId(): string {
  return CryptoJS.lib.WordArray.random(16).toString();
}

export async function createTransaction(
  input: CreateTransactionInput,
): Promise<TransactionResult> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        id: generateTransactionId(),
        status: 'APPROVED',
        amountInCents: input.amountInCents,
        currency: input.currency,
        productId: input.productId,
        createdAt: new Date().toISOString(),
      });
    }, SIMULATED_DELAY_MS);
  });
}
