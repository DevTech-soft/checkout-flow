import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createTransaction } from '@services/transactions/transactionService';
import type { TransactionResult } from '@services/transactions/transaction.types';
import type { RootState } from '@redux/store';
import type { AsyncStatus } from '@redux/types';

export interface TransactionState {
  id: string | null;
  status: TransactionResult['status'] | null;
  amountInCents: number | null;
  currency: string | null;
  productId: string | null;
  createdAt: string | null;
  requestStatus: AsyncStatus;
  error: string | null;
}

export type PersistedTransactionState = Pick<
  TransactionState,
  'id' | 'status' | 'amountInCents' | 'currency' | 'productId' | 'createdAt'
>;

const initialState: TransactionState = {
  id: null,
  status: null,
  amountInCents: null,
  currency: null,
  productId: null,
  createdAt: null,
  requestStatus: 'idle',
  error: null,
};

export const submitTransaction = createAsyncThunk<
  TransactionResult,
  void,
  { state: RootState }
>('transaction/submitTransaction', async (_, { getState, rejectWithValue }) => {
  const { order, products } = getState();
  const product = products.items.find(item => item.id === order.productId);

  if (!order.productId || !order.quantity || !product) {
    return rejectWithValue('No hay una orden activa para procesar el pago.');
  }

  return createTransaction({
    productId: order.productId,
    quantity: order.quantity,
    amountInCents: product.priceInCents * order.quantity,
    currency: product.currency,
  });
});

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    resetTransaction: () => initialState,
    hydrate: (state, action: PayloadAction<PersistedTransactionState>) => ({
      ...state,
      ...action.payload,
      requestStatus: action.payload.id ? 'succeeded' : 'idle',
      error: null,
    }),
  },
  extraReducers: builder => {
    builder
      .addCase(submitTransaction.pending, state => {
        state.requestStatus = 'loading';
        state.error = null;
      })
      .addCase(
        submitTransaction.fulfilled,
        (state, action: PayloadAction<TransactionResult>) => {
          state.requestStatus = 'succeeded';
          state.id = action.payload.id;
          state.status = action.payload.status;
          state.amountInCents = action.payload.amountInCents;
          state.currency = action.payload.currency;
          state.productId = action.payload.productId;
          state.createdAt = action.payload.createdAt;
        },
      )
      .addCase(submitTransaction.rejected, (state, action) => {
        state.requestStatus = 'failed';
        state.error =
          (action.payload as string | undefined) ??
          'No pudimos procesar tu pago.';
      });
  },
});

export const { resetTransaction, hydrate: hydrateTransaction } =
  transactionSlice.actions;

export const selectTransaction = (state: RootState) => state.transaction;

export default transactionSlice.reducer;
