jest.mock('@storage/secureStorage');

import { secureStorage } from '@storage/secureStorage';
import {
  PERSIST_KEY,
  loadPersistedState,
  savePersistedState,
} from './persistedState';
import type { PersistedState } from './persistedState';
import type { RootState } from '@redux/store';

const mockedSecureStorage = secureStorage as jest.Mocked<typeof secureStorage>;

describe('persistedState', () => {
  beforeEach(() => {
    mockedSecureStorage.getItem.mockReset();
    mockedSecureStorage.setItem.mockReset();
  });

  it('loads the persisted state from secure storage', async () => {
    const persisted: PersistedState = {
      order: { productId: '1', quantity: 2 },
      checkout: {
        customer: {
          fullName: 'Jane Doe',
          email: 'jane@example.com',
          phoneNumber: '+57 300 000 0000',
        },
      },
      transaction: {
        id: 'txn-123',
        status: 'APPROVED',
        amountInCents: 24000000,
        currency: 'COP',
        productId: '1',
        createdAt: '2026-07-10T00:00:00.000Z',
      },
    };
    mockedSecureStorage.getItem.mockResolvedValue(persisted);

    const result = await loadPersistedState();

    expect(mockedSecureStorage.getItem).toHaveBeenCalledWith(PERSIST_KEY);
    expect(result).toEqual(persisted);
  });

  it('returns null when nothing is persisted yet', async () => {
    mockedSecureStorage.getItem.mockResolvedValue(null);

    const result = await loadPersistedState();

    expect(result).toBeNull();
  });

  it('persists only the whitelisted slices, dropping transient transaction fields', async () => {
    mockedSecureStorage.setItem.mockResolvedValue(undefined);

    const state = {
      order: { productId: '1', quantity: 2 },
      checkout: { customer: null },
      card: { card: null },
      products: { items: [], status: 'idle', error: null },
      transaction: {
        id: 'txn-123',
        status: 'APPROVED',
        amountInCents: 24000000,
        currency: 'COP',
        productId: '1',
        createdAt: '2026-07-10T00:00:00.000Z',
        requestStatus: 'succeeded',
        error: null,
      },
    } as unknown as RootState;

    await savePersistedState(state);

    expect(mockedSecureStorage.setItem).toHaveBeenCalledWith(PERSIST_KEY, {
      order: { productId: '1', quantity: 2 },
      checkout: { customer: null },
      transaction: {
        id: 'txn-123',
        status: 'APPROVED',
        amountInCents: 24000000,
        currency: 'COP',
        productId: '1',
        createdAt: '2026-07-10T00:00:00.000Z',
      },
    });
  });
});
