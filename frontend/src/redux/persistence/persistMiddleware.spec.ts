jest.mock('./persistedState', () => ({
  PERSISTED_SLICE_KEYS: ['order', 'checkout', 'transaction'],
  savePersistedState: jest.fn().mockResolvedValue(undefined),
}));

import { configureStore, createSlice } from '@reduxjs/toolkit';
import type { Middleware } from '@reduxjs/toolkit';
import { persistenceMiddleware } from './persistMiddleware';
import { savePersistedState } from './persistedState';

const mockedSavePersistedState = savePersistedState as jest.MockedFunction<
  typeof savePersistedState
>;

const dummySlice = createSlice({
  name: 'order',
  initialState: { value: 0 },
  reducers: {
    setOrder: state => {
      state.value += 1;
    },
  },
});

const productsSlice = createSlice({
  name: 'products',
  initialState: { value: 0 },
  reducers: {
    fetchProducts: state => {
      state.value += 1;
    },
  },
});

type DummyState = {
  order: { value: number };
  products: { value: number };
};

function buildStore() {
  return configureStore({
    reducer: { order: dummySlice.reducer, products: productsSlice.reducer },
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware().concat(
        persistenceMiddleware as unknown as Middleware<{}, DummyState>,
      ),
  });
}

describe('persistenceMiddleware', () => {
  beforeEach(() => {
    mockedSavePersistedState.mockClear();
  });

  it('persists the state when a whitelisted slice action is dispatched', async () => {
    const store = buildStore();

    store.dispatch(dummySlice.actions.setOrder());
    await Promise.resolve();

    expect(mockedSavePersistedState).toHaveBeenCalledTimes(1);
    expect(mockedSavePersistedState).toHaveBeenCalledWith(store.getState());
  });

  it('does not persist for actions outside the whitelist', async () => {
    const store = buildStore();

    store.dispatch(productsSlice.actions.fetchProducts());
    await Promise.resolve();

    expect(mockedSavePersistedState).not.toHaveBeenCalled();
  });

  it('swallows persistence failures without breaking the dispatch', async () => {
    mockedSavePersistedState.mockRejectedValueOnce(new Error('disk full'));
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const store = buildStore();

    store.dispatch(dummySlice.actions.setOrder());
    await Promise.resolve();
    await Promise.resolve();

    expect(warnSpy).toHaveBeenCalledWith(
      '[persistence] Failed to persist state',
      expect.any(Error),
    );
    warnSpy.mockRestore();
  });
});
