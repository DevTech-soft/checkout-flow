import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CardBrand } from '@utils/cardBrand';
import type { RootState } from '@redux/store';

export type CardSummary = {
  brand: CardBrand;
  lastFourDigits: string;
  cardHolder: string;
  expiryDate: string;
  token: string;
};

export interface CardState {
  card: CardSummary | null;
}

const initialState: CardState = {
  card: null,
};

const cardSlice = createSlice({
  name: 'card',
  initialState,
  reducers: {
    setCard: (state, action: PayloadAction<CardSummary>) => {
      state.card = action.payload;
    },
    clearCard: () => initialState,
  },
});

export const { setCard, clearCard } = cardSlice.actions;

export const selectCard = (state: RootState) => state.card.card;

export default cardSlice.reducer;
