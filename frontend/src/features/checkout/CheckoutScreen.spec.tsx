import { fireEvent, screen } from '@testing-library/react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import CheckoutScreen from './CheckoutScreen';
import { renderWithProviders } from '../../tests/renderWithProviders';
import type { RootStackParamList } from '@navigation/routes';
import type { RootState } from '@redux/store';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

function buildProps(navigate: jest.Mock): Props {
  return {
    navigation: { navigate } as unknown as Props['navigation'],
    route: { key: 'checkout', name: 'Checkout', params: undefined },
  };
}

const preloadedState: Partial<RootState> = {
  order: { items: [{ productId: '1', quantity: 2 }] },
  products: {
    items: [
      {
        id: '1',
        name: 'Audífonos Bluetooth',
        description: 'Audífonos inalámbricos con cancelación de ruido.',
        priceInCents: 12000000,
        currency: 'COP',
        stock: 10,
        imageUrl: 'https://placehold.co/400x400?text=Audifonos',
      },
    ],
    status: 'succeeded',
    error: null,
  },
};

describe('CheckoutScreen', () => {
  it('renders the order summary', async () => {
    await renderWithProviders(<CheckoutScreen {...buildProps(jest.fn())} />, {
      preloadedState,
    });

    expect(screen.getByText('Audífonos Bluetooth x2')).toBeTruthy();
  });

  it('blocks continuing when the customer form is invalid', async () => {
    const navigate = jest.fn();
    await renderWithProviders(<CheckoutScreen {...buildProps(navigate)} />, {
      preloadedState,
    });

    await fireEvent.press(screen.getByText('Continuar'));

    expect(screen.getByText('Ingresa el nombre completo')).toBeTruthy();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('stores the customer data and navigates to CardForm when valid', async () => {
    const navigate = jest.fn();
    const { store } = await renderWithProviders(
      <CheckoutScreen {...buildProps(navigate)} />,
      { preloadedState },
    );

    await fireEvent.changeText(
      screen.getByLabelText('Nombre completo'),
      'Jane Doe',
    );
    await fireEvent.changeText(
      screen.getByLabelText('Correo electrónico'),
      'jane@example.com',
    );
    await fireEvent.changeText(screen.getByLabelText('Teléfono'), '3001234567');

    await fireEvent.press(screen.getByText('Continuar'));

    expect(navigate).toHaveBeenCalledWith('CardForm');
    expect(store.getState().checkout.customer).toEqual({
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      phoneNumber: '3001234567',
    });
  });
});
