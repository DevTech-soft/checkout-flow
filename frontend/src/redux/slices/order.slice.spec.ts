import { configureStore } from '@reduxjs/toolkit';
import orderReducer, {
  clearOrder,
  hydrateOrder,
  selectOrder,
  setOrder,
} from './order.slice';
import type { RootState } from '@redux/store';

function buildStore() {
  return configureStore({ reducer: { order: orderReducer } });
}

describe('order.slice', () => {
  it('starts with no active order', () => {
    const store = buildStore();
    const state = store.getState() as unknown as RootState;

    expect(selectOrder(state)).toEqual({ items: [] });
  });

  it('stores the items on setOrder', () => {
    const store = buildStore();

    store.dispatch(setOrder([{ productId: '1', quantity: 2 }]));
    const state = store.getState() as unknown as RootState;

    expect(selectOrder(state)).toEqual({
      items: [{ productId: '1', quantity: 2 }],
    });
  });

  it('clears the order on clearOrder', () => {
    const store = buildStore();

    store.dispatch(setOrder([{ productId: '1', quantity: 2 }]));
    store.dispatch(clearOrder());
    const state = store.getState() as unknown as RootState;

    expect(selectOrder(state)).toEqual({ items: [] });
  });

  it('replaces the whole slice on hydrate', () => {
    const store = buildStore();

    store.dispatch(hydrateOrder({ items: [{ productId: '2', quantity: 3 }] }));
    const state = store.getState() as unknown as RootState;

    expect(selectOrder(state)).toEqual({
      items: [{ productId: '2', quantity: 3 }],
    });
  });
});
