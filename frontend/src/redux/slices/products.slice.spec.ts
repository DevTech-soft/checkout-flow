import { configureStore } from '@reduxjs/toolkit';
import productsReducer, {
  fetchProducts,
  selectProductById,
  selectProducts,
  selectProductsError,
  selectProductsStatus,
} from './products.slice';
import type { RootState } from '@redux/store';

function buildStore() {
  return configureStore({ reducer: { products: productsReducer } });
}

describe('products.slice', () => {
  it('starts idle with no products', () => {
    const store = buildStore();
    const state = store.getState() as unknown as RootState;

    expect(selectProductsStatus(state)).toBe('idle');
    expect(selectProducts(state)).toEqual([]);
  });

  it('loads the catalog on fetchProducts', async () => {
    const store = buildStore();

    await store.dispatch(fetchProducts());
    const state = store.getState() as unknown as RootState;

    expect(selectProductsStatus(state)).toBe('succeeded');
    expect(selectProductsError(state)).toBeNull();
    expect(selectProducts(state).length).toBeGreaterThan(0);
  });

  it('resolves a product by id once loaded', async () => {
    const store = buildStore();

    await store.dispatch(fetchProducts());
    const state = store.getState() as unknown as RootState;

    expect(selectProductById('1')(state)?.name).toBe('Audífonos Bluetooth');
    expect(selectProductById('missing')(state)).toBeNull();
    expect(selectProductById(null)(state)).toBeNull();
  });
});
