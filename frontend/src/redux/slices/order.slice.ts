import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@redux/store';

export interface OrderState {
  productId: string | null;
  quantity: number | null;
}

const initialState: OrderState = {
  productId: null,
  quantity: null,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setOrder: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>,
    ) => {
      state.productId = action.payload.productId;
      state.quantity = action.payload.quantity;
    },
    clearOrder: () => initialState,
    hydrate: (_state, action: PayloadAction<OrderState>) => action.payload,
  },
});

export const { setOrder, clearOrder, hydrate: hydrateOrder } =
  orderSlice.actions;

export const selectOrder = (state: RootState) => state.order;

export default orderSlice.reducer;
