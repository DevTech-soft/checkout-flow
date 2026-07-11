import { combineReducers, configureStore } from '@reduxjs/toolkit';
import productsReducer from './products.slice';
import cartReducer, {
  addItem,
  clearCart,
  hydrateCart,
  removeItem,
  selectCartItemCount,
  selectCartItems,
  selectCartLines,
  selectCartTotal,
  setItemQuantity,
} from './cart.slice';
import type { Product } from '@services/products/product.types';
import type { RootState } from '@redux/store';

const headphones: Product = {
  id: '1',
  name: 'Audífonos Bluetooth',
  description: 'Audífonos inalámbricos con cancelación de ruido.',
  priceInCents: 12000000,
  currency: 'COP',
  stock: 10,
  imageUrl: 'https://placehold.co/400x400?text=Audifonos',
};

const mouse: Product = {
  id: '2',
  name: 'Mouse inalámbrico',
  description: 'Mouse ergonómico con batería recargable.',
  priceInCents: 8900000,
  currency: 'COP',
  stock: 20,
  imageUrl: 'https://placehold.co/400x400?text=Mouse',
};

function buildStore(preloadedState?: Partial<RootState>) {
  const reducer = combineReducers({
    products: productsReducer,
    cart: cartReducer,
  });
  return configureStore({ reducer, preloadedState });
}

describe('cart.slice', () => {
  it('starts empty', () => {
    const store = buildStore();
    const state = store.getState() as unknown as RootState;

    expect(selectCartItems(state)).toEqual([]);
    expect(selectCartItemCount(state)).toBe(0);
  });

  it('adds a new product to the cart', () => {
    const store = buildStore();

    store.dispatch(addItem({ productId: '1', quantity: 2 }));
    const state = store.getState() as unknown as RootState;

    expect(selectCartItems(state)).toEqual([{ productId: '1', quantity: 2 }]);
  });

  it('accumulates the quantity when the same product is added again', () => {
    const store = buildStore();

    store.dispatch(addItem({ productId: '1', quantity: 2 }));
    store.dispatch(addItem({ productId: '1', quantity: 3 }));
    const state = store.getState() as unknown as RootState;

    expect(selectCartItems(state)).toEqual([{ productId: '1', quantity: 5 }]);
  });

  it('removes a product from the cart', () => {
    const store = buildStore();

    store.dispatch(addItem({ productId: '1', quantity: 2 }));
    store.dispatch(addItem({ productId: '2', quantity: 1 }));
    store.dispatch(removeItem('1'));
    const state = store.getState() as unknown as RootState;

    expect(selectCartItems(state)).toEqual([{ productId: '2', quantity: 1 }]);
  });

  it('updates the quantity of an existing line', () => {
    const store = buildStore();

    store.dispatch(addItem({ productId: '1', quantity: 2 }));
    store.dispatch(setItemQuantity({ productId: '1', quantity: 5 }));
    const state = store.getState() as unknown as RootState;

    expect(selectCartItems(state)).toEqual([{ productId: '1', quantity: 5 }]);
  });

  it('removes the line when setItemQuantity drops to zero or below', () => {
    const store = buildStore();

    store.dispatch(addItem({ productId: '1', quantity: 2 }));
    store.dispatch(setItemQuantity({ productId: '1', quantity: 0 }));
    const state = store.getState() as unknown as RootState;

    expect(selectCartItems(state)).toEqual([]);
  });

  it('clears the cart', () => {
    const store = buildStore();

    store.dispatch(addItem({ productId: '1', quantity: 2 }));
    store.dispatch(clearCart());
    const state = store.getState() as unknown as RootState;

    expect(selectCartItems(state)).toEqual([]);
  });

  it('replaces the whole slice on hydrate', () => {
    const store = buildStore();

    store.dispatch(hydrateCart({ items: [{ productId: '3', quantity: 4 }] }));
    const state = store.getState() as unknown as RootState;

    expect(selectCartItems(state)).toEqual([{ productId: '3', quantity: 4 }]);
  });

  it('joins cart items with the product catalog and computes the total', () => {
    const store = buildStore({
      products: { items: [headphones, mouse], status: 'succeeded', error: null },
    });

    store.dispatch(addItem({ productId: '1', quantity: 2 }));
    store.dispatch(addItem({ productId: '2', quantity: 3 }));
    const state = store.getState() as unknown as RootState;

    expect(selectCartLines(state)).toEqual([
      { product: headphones, quantity: 2 },
      { product: mouse, quantity: 3 },
    ]);
    expect(selectCartTotal(state)).toBe(
      headphones.priceInCents * 2 + mouse.priceInCents * 3,
    );
  });

  it('drops lines whose product no longer exists in the catalog', () => {
    const store = buildStore({
      products: { items: [headphones], status: 'succeeded', error: null },
    });

    store.dispatch(addItem({ productId: '1', quantity: 1 }));
    store.dispatch(addItem({ productId: 'missing', quantity: 1 }));
    const state = store.getState() as unknown as RootState;

    expect(selectCartLines(state)).toEqual([
      { product: headphones, quantity: 1 },
    ]);
  });
});
