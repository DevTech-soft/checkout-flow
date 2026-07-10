import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import CheckoutScreen from './CheckoutScreen';
import type { RootStackParamList } from '@navigation/routes';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

function buildProps(navigate: jest.Mock): Props {
  return {
    navigation: { navigate } as unknown as Props['navigation'],
    route: {
      key: 'checkout',
      name: 'Checkout',
      params: { productId: '1', quantity: 2 },
    },
  };
}

describe('CheckoutScreen', () => {
  it('renders the order summary', async () => {
    await render(<CheckoutScreen {...buildProps(jest.fn())} />);

    await waitFor(() => {
      expect(screen.getByText('Audífonos Bluetooth x2')).toBeTruthy();
    });
  });

  it('blocks continuing when the customer form is invalid', async () => {
    const navigate = jest.fn();
    await render(<CheckoutScreen {...buildProps(navigate)} />);

    await waitFor(() => {
      expect(screen.getByText('Continuar')).toBeTruthy();
    });

    await fireEvent.press(screen.getByText('Continuar'));

    expect(screen.getByText('Ingresa el nombre completo')).toBeTruthy();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('navigates to CardForm with the customer data when valid', async () => {
    const navigate = jest.fn();
    await render(<CheckoutScreen {...buildProps(navigate)} />);

    await waitFor(() => {
      expect(screen.getByText('Nombre completo')).toBeTruthy();
    });

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

    expect(navigate).toHaveBeenCalledWith('CardForm', {
      productId: '1',
      quantity: 2,
      customer: {
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        phoneNumber: '3001234567',
      },
    });
  });
});
