import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import HomeScreen from './HomeScreen';
import { renderWithProviders } from '../../tests/renderWithProviders';
import type { RootStackParamList } from '@navigation/routes';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

function buildProps(navigate: jest.Mock): Props {
  return {
    navigation: { navigate } as unknown as Props['navigation'],
    route: { key: 'home', name: 'Home', params: undefined },
  };
}

describe('HomeScreen', () => {
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
