import { createSelector, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { selectProducts } from '@redux/slices/products.slice';
import type { Product } from '@services/products/product.types';
import type { RootState } from '@redux/store';

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
}

export interface CartLine {
  product: Product;
  quantity: number;
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find(
        item => item.productId === action.payload.productId,
      );
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        item => item.productId !== action.payload,
      );
    },
    setItemQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>,
    ) => {
      if (action.payload.quantity <= 0) {
        state.items = state.items.filter(
          item => item.productId !== action.payload.productId,
        );
        return;
      }
      const existing = state.items.find(
        item => item.productId === action.payload.productId,
      );
      if (existing) {
        existing.quantity = action.payload.quantity;
      }
    },
    clearCart: () => initialState,
    hydrate: (_state, action: PayloadAction<CartState>) => action.payload,
  },
});

export const {
  addItem,
  removeItem,
  setItemQuantity,
  clearCart,
  hydrate: hydrateCart,
} = cartSlice.actions;

export const selectCartItems = (state: RootState) => state.cart.items;

export const selectCartItemCount = (state: RootState) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);

export const selectCartLines = createSelector(
  [selectCartItems, selectProducts],
  (items, products): CartLine[] =>
    items.reduce<CartLine[]>((lines, item) => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        lines.push({ product, quantity: item.quantity });
      }
      return lines;
    }, []),
);

export const selectCartTotal = createSelector([selectCartLines], lines =>
  lines.reduce(
    (total, line) => total + line.product.priceInCents * line.quantity,
    0,
  ),
);

export default cartSlice.reducer;
