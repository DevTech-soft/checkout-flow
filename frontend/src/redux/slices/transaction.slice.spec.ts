import { combineReducers, configureStore } from '@reduxjs/toolkit';
import productsReducer from './products.slice';
import orderReducer, { setOrder } from './order.slice';
import checkoutReducer from './checkout.slice';
import cardReducer from './card.slice';
import transactionReducer, {
  hydrateTransaction,
  resetTransaction,
  selectTransaction,
  submitTransaction,
} from './transaction.slice';
import type { PersistedTransactionState } from './transaction.slice';
import type { Product } from '@services/products/product.types';
import type { RootState } from '@redux/store';

jest.mock('@services/transactions/transactionService');

import { createTransaction } from '@services/transactions/transactionService';

const mockedCreateTransaction = createTransaction as jest.MockedFunction<
  typeof createTransaction
>;

const product: Product = {
  id: '1',
  name: 'Audífonos Bluetooth',
  description: 'Audífonos inalámbricos con cancelación de ruido.',
  priceInCents: 12000000,
  currency: 'COP',
  stock: 10,
  imageUrl: 'https://placehold.co/400x400?text=Audifonos',
};

function buildStore(preloadedState?: Partial<RootState>) {
  const reducer = combineReducers({
    products: productsReducer,
    order: orderReducer,
    checkout: checkoutReducer,
    card: cardReducer,
    transaction: transactionReducer,
  });

  return configureStore({ reducer, preloadedState });
}

describe('transaction.slice', () => {
  beforeEach(() => {
    mockedCreateTransaction.mockReset();
  });

  it('starts idle with no transaction data', () => {
    const store = buildStore();
    const state = store.getState() as unknown as RootState;

    expect(selectTransaction(state)).toEqual({
      id: null,
      status: null,
      amountInCents: null,
      currency: null,
      productId: null,
      createdAt: null,
      requestStatus: 'idle',
      error: null,
    });
  });

  it('rejects when there is no active order', async () => {
    const store = buildStore();

    await store.dispatch(submitTransaction());
    const state = store.getState() as unknown as RootState;

    expect(selectTransaction(state).requestStatus).toBe('failed');
    expect(selectTransaction(state).error).toBe(
      'No hay una orden activa para procesar el pago.',
    );
    expect(mockedCreateTransaction).not.toHaveBeenCalled();
  });

  it('submits the transaction for the active order and product', async () => {
    mockedCreateTransaction.mockResolvedValue({
      id: 'txn-123',
      status: 'APPROVED',
      amountInCents: 24000000,
      currency: 'COP',
      productId: '1',
      createdAt: '2026-07-10T00:00:00.000Z',
    });

    const store = buildStore({
      products: { items: [product], status: 'succeeded', error: null },
    });
    store.dispatch(setOrder({ productId: '1', quantity: 2 }));

    await store.dispatch(submitTransaction());
    const state = store.getState() as unknown as RootState;

    expect(mockedCreateTransaction).toHaveBeenCalledWith({
      productId: '1',
      quantity: 2,
      amountInCents: 24000000,
      currency: 'COP',
    });
    expect(selectTransaction(state)).toEqual({
      id: 'txn-123',
      status: 'APPROVED',
      amountInCents: 24000000,
      currency: 'COP',
      productId: '1',
      createdAt: '2026-07-10T00:00:00.000Z',
      requestStatus: 'succeeded',
      error: null,
    });
  });

  it('resets to the initial state on resetTransaction', () => {
    const store = buildStore();

    store.dispatch(
      hydrateTransaction({
        id: 'txn-123',
        status: 'APPROVED',
        amountInCents: 24000000,
        currency: 'COP',
        productId: '1',
        createdAt: '2026-07-10T00:00:00.000Z',
      }),
    );
    store.dispatch(resetTransaction());
    const state = store.getState() as unknown as RootState;

    expect(selectTransaction(state).id).toBeNull();
    expect(selectTransaction(state).requestStatus).toBe('idle');
  });

  it('hydrates as succeeded when a persisted transaction has an id', () => {
    const store = buildStore();
    const persisted: PersistedTransactionState = {
      id: 'txn-123',
      status: 'APPROVED',
      amountInCents: 24000000,
      currency: 'COP',
      productId: '1',
      createdAt: '2026-07-10T00:00:00.000Z',
    };

    store.dispatch(hydrateTransaction(persisted));
    const state = store.getState() as unknown as RootState;

    expect(selectTransaction(state).requestStatus).toBe('succeeded');
    expect(selectTransaction(state).error).toBeNull();
  });

  it('hydrates as idle when there is no persisted transaction id', () => {
    const store = buildStore();

    store.dispatch(
      hydrateTransaction({
        id: null,
        status: null,
        amountInCents: null,
        currency: null,
        productId: null,
        createdAt: null,
      }),
    );
    const state = store.getState() as unknown as RootState;

    expect(selectTransaction(state).requestStatus).toBe('idle');
  });
});
