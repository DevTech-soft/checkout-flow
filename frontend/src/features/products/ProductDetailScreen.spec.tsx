import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ProductDetailScreen from './ProductDetailScreen';
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
    await render(<ProductDetailScreen {...buildProps(jest.fn(), '1')} />);

    await waitFor(() => {
      expect(screen.getByText('Audífonos Bluetooth')).toBeTruthy();
    });
    expect(screen.getByText('10 disponibles')).toBeTruthy();
  });

  it('shows an error state for an unknown product', async () => {
    await render(<ProductDetailScreen {...buildProps(jest.fn(), 'missing')} />);

    await waitFor(() => {
      expect(screen.getByText('Producto no encontrado.')).toBeTruthy();
    });
  });

  it('increases and decreases the quantity within stock limits', async () => {
    await render(<ProductDetailScreen {...buildProps(jest.fn(), '1')} />);

    await waitFor(() => {
      expect(screen.getByText('1')).toBeTruthy();
    });

    await fireEvent.press(screen.getByText('+'));

    expect(screen.getByText('2')).toBeTruthy();

    await fireEvent.press(screen.getByText('-'));

    expect(screen.getByText('1')).toBeTruthy();
  });

  it('navigates to Checkout with the selected quantity', async () => {
    const navigate = jest.fn();
    await render(<ProductDetailScreen {...buildProps(navigate, '1')} />);

    await waitFor(() => {
      expect(screen.getByText('Comprar')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Comprar'));

    expect(navigate).toHaveBeenCalledWith('Checkout', {
      productId: '1',
      quantity: 1,
    });
  });
});
