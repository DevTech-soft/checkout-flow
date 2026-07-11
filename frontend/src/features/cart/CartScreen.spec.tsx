import { fireEvent, screen } from '@testing-library/react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import CartScreen from './CartScreen';
import { renderWithProviders } from '../../tests/renderWithProviders';
import type { RootStackParamList } from '@navigation/routes';
import type { RootState } from '@redux/store';
import type { Product } from '@services/products/product.types';

type Props = NativeStackScreenProps<RootStackParamList, 'Cart'>;

function buildProps(navigate: jest.Mock): Props {
  return {
    navigation: { navigate } as unknown as Props['navigation'],
    route: { key: 'cart', name: 'Cart', params: undefined },
  };
}

const headphones: Product = {
  id: '1',
  name: 'Audífonos Bluetooth',
  description: 'Audífonos inalámbricos con cancelación de ruido.',
  priceInCents: 12000000,
  currency: 'COP',
  stock: 3,
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

function withCart(items: { productId: string; quantity: number }[]): Partial<RootState> {
  return {
    products: {
      items: [headphones, mouse],
      status: 'succeeded',
      error: null,
    },
    cart: { items },
  };
}

describe('CartScreen', () => {
  it('shows an empty state when the cart has no items', async () => {
    await renderWithProviders(<CartScreen {...buildProps(jest.fn())} />, {
      preloadedState: withCart([]),
    });

    expect(screen.getByText('Tu carrito está vacío')).toBeTruthy();
  });

  it('renders each cart line with its subtotal', async () => {
    await renderWithProviders(<CartScreen {...buildProps(jest.fn())} />, {
      preloadedState: withCart([
        { productId: '1', quantity: 2 },
        { productId: '2', quantity: 1 },
      ]),
    });

    expect(screen.getByText('Audífonos Bluetooth')).toBeTruthy();
    expect(screen.getByText('Mouse inalámbrico')).toBeTruthy();
  });

  it('increases and decreases a line quantity within stock limits', async () => {
    const { store } = await renderWithProviders(
      <CartScreen {...buildProps(jest.fn())} />,
      { preloadedState: withCart([{ productId: '2', quantity: 1 }]) },
    );

    await fireEvent.press(screen.getByText('+'));

    expect(store.getState().cart.items).toEqual([
      { productId: '2', quantity: 2 },
    ]);

    await fireEvent.press(screen.getByText('-'));

    expect(store.getState().cart.items).toEqual([
      { productId: '2', quantity: 1 },
    ]);
  });

  it('does not increase past the available stock', async () => {
    const { store } = await renderWithProviders(
      <CartScreen {...buildProps(jest.fn())} />,
      { preloadedState: withCart([{ productId: '1', quantity: 3 }]) },
    );

    await fireEvent.press(screen.getByText('+'));

    expect(store.getState().cart.items).toEqual([
      { productId: '1', quantity: 3 },
    ]);
  });

  it('removes a line from the cart', async () => {
    const { store } = await renderWithProviders(
      <CartScreen {...buildProps(jest.fn())} />,
      { preloadedState: withCart([{ productId: '1', quantity: 1 }]) },
    );

    await fireEvent.press(screen.getByText('Eliminar'));

    expect(store.getState().cart.items).toEqual([]);
  });

  it('copies the cart into the order and navigates to Checkout', async () => {
    const navigate = jest.fn();
    const { store } = await renderWithProviders(
      <CartScreen {...buildProps(navigate)} />,
      {
        preloadedState: withCart([
          { productId: '1', quantity: 2 },
          { productId: '2', quantity: 1 },
        ]),
      },
    );

    await fireEvent.press(screen.getByText('Ir a pagar'));

    expect(navigate).toHaveBeenCalledWith('Checkout');
    expect(store.getState().order.items).toEqual([
      { productId: '1', quantity: 2 },
      { productId: '2', quantity: 1 },
    ]);
  });
});
