import { createSelector, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { selectProducts } from '@redux/slices/products.slice';
import type { Product } from '@services/products/product.types';
import type { RootState } from '@redux/store';

export interface OrderItem {
  productId: string;
  quantity: number;
}

export interface OrderState {
  items: OrderItem[];
}

export interface OrderLine {
  product: Product;
  quantity: number;
}

const initialState: OrderState = {
  items: [],
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setOrder: (state, action: PayloadAction<OrderItem[]>) => {
      state.items = action.payload;
    },
    clearOrder: () => initialState,
    hydrate: (_state, action: PayloadAction<OrderState>) => action.payload,
  },
});

export const { setOrder, clearOrder, hydrate: hydrateOrder } =
  orderSlice.actions;

export const selectOrder = (state: RootState) => state.order;
export const selectOrderItems = (state: RootState) => state.order.items;

export const selectOrderLines = createSelector(
  [selectOrderItems, selectProducts],
  (items, products): OrderLine[] =>
    items.reduce<OrderLine[]>((lines, item) => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        lines.push({ product, quantity: item.quantity });
      }
      return lines;
    }, []),
);

export const selectOrderTotal = createSelector([selectOrderLines], lines =>
  lines.reduce(
    (total, line) => total + line.product.priceInCents * line.quantity,
    0,
  ),
);

export default orderSlice.reducer;
