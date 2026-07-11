import { secureStorage } from '@storage/secureStorage';
import type { OrderState } from '@redux/slices/order.slice';
import type { CartState } from '@redux/slices/cart.slice';
import type { CheckoutState } from '@redux/slices/checkout.slice';
import type { PersistedTransactionState } from '@redux/slices/transaction.slice';
import type { RootState } from '@redux/store';

export const PERSIST_KEY = '@mobileTestApp/persistedState';

export const PERSISTED_SLICE_KEYS = [
  'order',
  'cart',
  'checkout',
  'transaction',
] as const;
export type PersistedSliceKey = (typeof PERSISTED_SLICE_KEYS)[number];

export interface PersistedState {
  order: OrderState;
  cart: CartState;
  checkout: CheckoutState;
  transaction: PersistedTransactionState;
}

export async function loadPersistedState(): Promise<PersistedState | null> {
  return secureStorage.getItem<PersistedState>(PERSIST_KEY);
}

export async function savePersistedState(state: RootState): Promise<void> {
  const persisted: PersistedState = {
    order: state.order,
    cart: state.cart,
    checkout: state.checkout,
    transaction: {
      id: state.transaction.id,
      status: state.transaction.status,
      amountInCents: state.transaction.amountInCents,
      currency: state.transaction.currency,
      items: state.transaction.items,
      createdAt: state.transaction.createdAt,
    },
  };

  await secureStorage.setItem(PERSIST_KEY, persisted);
}
