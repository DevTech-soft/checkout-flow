import { configureStore } from '@reduxjs/toolkit';
import checkoutReducer, {
  clearCustomer,
  hydrateCheckout,
  selectCustomer,
  setCustomer,
} from './checkout.slice';
import type { CustomerInfo } from './checkout.slice';
import type { RootState } from '@redux/store';

function buildStore() {
  return configureStore({ reducer: { checkout: checkoutReducer } });
}

const customer: CustomerInfo = {
  fullName: 'Jane Doe',
  email: 'jane@example.com',
  phoneNumber: '+57 300 000 0000',
};

describe('checkout.slice', () => {
  it('starts with no customer', () => {
    const store = buildStore();
    const state = store.getState() as unknown as RootState;

    expect(selectCustomer(state)).toBeNull();
  });

  it('stores the customer on setCustomer', () => {
    const store = buildStore();

    store.dispatch(setCustomer(customer));
    const state = store.getState() as unknown as RootState;

    expect(selectCustomer(state)).toEqual(customer);
  });

  it('clears the customer on clearCustomer', () => {
    const store = buildStore();

    store.dispatch(setCustomer(customer));
    store.dispatch(clearCustomer());
    const state = store.getState() as unknown as RootState;

    expect(selectCustomer(state)).toBeNull();
  });

  it('replaces the whole slice on hydrate', () => {
    const store = buildStore();

    store.dispatch(hydrateCheckout({ customer }));
    const state = store.getState() as unknown as RootState;

    expect(selectCustomer(state)).toEqual(customer);
  });
});
