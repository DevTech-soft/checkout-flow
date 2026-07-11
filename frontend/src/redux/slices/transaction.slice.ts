import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createTransaction } from '@services/transactions/transactionService';
import type {
  TransactionResult,
  TransactionResultItem,
} from '@services/transactions/transaction.types';
import type { RootState } from '@redux/store';
import type { AsyncStatus } from '@redux/types';

export interface TransactionState {
  id: string | null;
  status: TransactionResult['status'] | null;
  amountInCents: number | null;
  currency: string | null;
  items: TransactionResultItem[];
  createdAt: string | null;
  requestStatus: AsyncStatus;
  error: string | null;
}

export type PersistedTransactionState = Pick<
  TransactionState,
  'id' | 'status' | 'amountInCents' | 'currency' | 'items' | 'createdAt'
>;

const initialState: TransactionState = {
  id: null,
  status: null,
  amountInCents: null,
  currency: null,
  items: [],
  createdAt: null,
  requestStatus: 'idle',
  error: null,
};

export const submitTransaction = createAsyncThunk<
  TransactionResult,
  void,
  { state: RootState; rejectValue: string }
>(
  'transaction/submitTransaction',
  async (_, { getState, rejectWithValue }) => {
    const { order, products, checkout, card } = getState();

    if (order.items.length === 0) {
      return rejectWithValue('No hay una orden activa para procesar el pago.');
    }
    const hasAllProducts = order.items.every(item =>
      products.items.some(product => product.id === item.productId),
    );
    if (!hasAllProducts) {
      return rejectWithValue('No hay una orden activa para procesar el pago.');
    }
    if (!checkout.customer) {
      return rejectWithValue(
        'Completa tus datos de contacto antes de pagar.',
      );
    }
    if (!card.card) {
      return rejectWithValue('Ingresa los datos de tu tarjeta antes de pagar.');
    }

    try {
      return await createTransaction({
        items: order.items,
        cardToken: card.card.token,
        fullName: checkout.customer.fullName,
        email: checkout.customer.email,
        phoneNumber: checkout.customer.phoneNumber,
      });
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : 'No pudimos procesar tu pago.',
      );
    }
  },
);

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
          state.items = action.payload.items;
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
