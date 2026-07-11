jest.mock('@services/products/productService');

import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import HomeScreen from './HomeScreen';
import { renderWithProviders } from '../../tests/renderWithProviders';
import { getProducts } from '@services/products/productService';
import type { RootStackParamList } from '@navigation/routes';
import type { Product } from '@services/products/product.types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const mockedGetProducts = getProducts as jest.MockedFunction<
  typeof getProducts
>;

const catalog: Product[] = [
  {
    id: '1',
    name: 'Audífonos Bluetooth',
    description: 'Audífonos inalámbricos con cancelación de ruido.',
    priceInCents: 12000000,
    currency: 'COP',
    stock: 10,
    imageUrl: 'https://placehold.co/400x400?text=Audifonos',
  },
];

function buildProps(navigate: jest.Mock): Props {
  return {
    navigation: { navigate } as unknown as Props['navigation'],
    route: { key: 'home', name: 'Home', params: undefined },
  };
}

describe('HomeScreen', () => {
  beforeEach(() => {
    mockedGetProducts.mockReset().mockResolvedValue(catalog);
  });

  it('renders the mock product catalog', async () => {
    await renderWithProviders(<HomeScreen {...buildProps(jest.fn())} />);

    await waitFor(() => {
      expect(screen.getByText('Audífonos Bluetooth')).toBeTruthy();
    });
  });

  it('navigates to ProductDetail when a product is selected', async () => {
    const navigate = jest.fn();
    await renderWithProviders(<HomeScreen {...buildProps(navigate)} />);

    await waitFor(() => {
      expect(screen.getByText('Audífonos Bluetooth')).toBeTruthy();
    });

    await fireEvent.press(
      screen.getByRole('button', { name: 'Audífonos Bluetooth' }),
    );

    expect(navigate).toHaveBeenCalledWith('ProductDetail', {
      productId: '1',
    });
  });
});
