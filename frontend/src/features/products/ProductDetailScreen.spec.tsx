import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ProductDetailScreen from './ProductDetailScreen';
import { renderWithProviders } from '../../tests/renderWithProviders';
import type { RootStackParamList } from '@navigation/routes';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

function buildProps(navigate: jest.Mock, productId: string): Props {
  return {
    navigation: { navigate } as unknown as Props['navigation'],
    route: { key: 'product-detail', name: 'ProductDetail', params: { productId } },
  };
}

describe('ProductDetailScreen', () => {
  it('renders the product details', async () => {
    await renderWithProviders(
      <ProductDetailScreen {...buildProps(jest.fn(), '1')} />,
    );

    await waitFor(() => {
      expect(screen.getByText('Audífonos Bluetooth')).toBeTruthy();
    });
    expect(screen.getByText('10 disponibles')).toBeTruthy();
  });

  it('shows an error state for an unknown product', async () => {
    await renderWithProviders(
      <ProductDetailScreen {...buildProps(jest.fn(), 'missing')} />,
    );

    await waitFor(() => {
      expect(screen.getByText('Producto no encontrado.')).toBeTruthy();
    });
  });

  it('increases and decreases the quantity within stock limits', async () => {
    await renderWithProviders(
      <ProductDetailScreen {...buildProps(jest.fn(), '1')} />,
    );

    await waitFor(() => {
      expect(screen.getByText('1')).toBeTruthy();
    });

    await fireEvent.press(screen.getByText('+'));
    expect(screen.getByText('2')).toBeTruthy();

    await fireEvent.press(screen.getByText('-'));
    expect(screen.getByText('1')).toBeTruthy();
  });

  it('stores the order in Redux and navigates to Checkout', async () => {
    const navigate = jest.fn();
    const { store } = await renderWithProviders(
      <ProductDetailScreen {...buildProps(navigate, '1')} />,
    );

    await waitFor(() => {
      expect(screen.getByText('Comprar')).toBeTruthy();
    });

    await fireEvent.press(screen.getByText('Comprar'));

    expect(navigate).toHaveBeenCalledWith('Checkout');
    expect(store.getState().order).toEqual({ productId: '1', quantity: 1 });
  });
});
