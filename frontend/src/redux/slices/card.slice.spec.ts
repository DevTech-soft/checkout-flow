import { configureStore } from '@reduxjs/toolkit';
import cardReducer, { clearCard, selectCard, setCard } from './card.slice';
import type { CardSummary } from './card.slice';
import type { RootState } from '@redux/store';

function buildStore() {
  return configureStore({ reducer: { card: cardReducer } });
}

const summary: CardSummary = {
  brand: 'VISA',
  lastFourDigits: '4242',
  cardHolder: 'Jane Doe',
  expiryDate: '12/28',
  token: 'tok_test_123',
};

describe('card.slice', () => {
  it('starts with no card stored', () => {
    const store = buildStore();
    const state = store.getState() as unknown as RootState;

    expect(selectCard(state)).toBeNull();
  });

  it('stores the card summary on setCard', () => {
    const store = buildStore();

    store.dispatch(setCard(summary));
    const state = store.getState() as unknown as RootState;

    expect(selectCard(state)).toEqual(summary);
  });

  it('clears the card on clearCard', () => {
    const store = buildStore();

    store.dispatch(setCard(summary));
    store.dispatch(clearCard());
    const state = store.getState() as unknown as RootState;

    expect(selectCard(state)).toBeNull();
  });
});
