import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { getProducts } from '@services/products/productService';
import type { Product } from '@services/products/product.types';
import type { RootState } from '@redux/store';
import type { AsyncStatus } from '@redux/types';

export interface ProductsState {
  items: Product[];
  status: AsyncStatus;
  error: string | null;
}

const initialState: ProductsState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchProducts = createAsyncThunk<Product[]>(
  'products/fetchProducts',
  async () => getProducts(),
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchProducts.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(
        fetchProducts.fulfilled,
        (state, action: PayloadAction<Product[]>) => {
          state.status = 'succeeded';
          state.items = action.payload;
        },
      )
      .addCase(fetchProducts.rejected, state => {
        state.status = 'failed';
        state.error = 'No pudimos cargar los productos.';
      });
  },
});

export const selectProducts = (state: RootState) => state.products.items;
export const selectProductsStatus = (state: RootState) =>
  state.products.status;
export const selectProductsError = (state: RootState) => state.products.error;
export const selectProductById =
  (productId: string | null | undefined) => (state: RootState) =>
    productId
      ? (state.products.items.find(item => item.id === productId) ?? null)
      : null;

export default productsSlice.reducer;
