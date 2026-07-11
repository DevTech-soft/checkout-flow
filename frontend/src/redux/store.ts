import { combineReducers, configureStore } from '@reduxjs/toolkit';
import productsReducer from './slices/products.slice';
import orderReducer from './slices/order.slice';
import checkoutReducer from './slices/checkout.slice';
import cardReducer from './slices/card.slice';
import transactionReducer from './slices/transaction.slice';
import { persistenceMiddleware } from './persistence/persistMiddleware';

const rootReducer = combineReducers({
  products: productsReducer,
  order: orderReducer,
  checkout: checkoutReducer,
  card: cardReducer,
  transaction: transactionReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export function createAppStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware().concat(persistenceMiddleware),
  });
}

export const store = createAppStore();

export type AppDispatch = typeof store.dispatch;
