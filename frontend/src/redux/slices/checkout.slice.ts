import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@redux/store';

export type CustomerInfo = {
  fullName: string;
  email: string;
  phoneNumber: string;
};

export interface CheckoutState {
  customer: CustomerInfo | null;
}

const initialState: CheckoutState = {
  customer: null,
};

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setCustomer: (state, action: PayloadAction<CustomerInfo>) => {
      state.customer = action.payload;
    },
    clearCustomer: () => initialState,
    hydrate: (_state, action: PayloadAction<CheckoutState>) => action.payload,
  },
});

export const {
  setCustomer,
  clearCustomer,
  hydrate: hydrateCheckout,
} = checkoutSlice.actions;

export const selectCustomer = (state: RootState) => state.checkout.customer;

export default checkoutSlice.reducer;
