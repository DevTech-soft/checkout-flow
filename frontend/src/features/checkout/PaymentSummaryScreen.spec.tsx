import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import PaymentSummaryScreen from './PaymentSummaryScreen';
import { renderWithProviders } from '../../tests/renderWithProviders';
import type { RootStackParamList } from '@navigation/routes';
import type { RootState } from '@redux/store';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentSummary'>;

jest.useFakeTimers();

function buildProps(navigate: jest.Mock): Props {
  return {
    navigation: { navigate } as unknown as Props['navigation'],
    route: {
      key: 'payment-summary',
      name: 'PaymentSummary',
      params: undefined,
    },
  };
}

const preloadedState: Partial<RootState> = {
  order: { productId: '1', quantity: 2 },
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
  checkout: {
    customer: {
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      phoneNumber: '3001234567',
    },
  },
  card: {
    card: {
      brand: 'VISA',
      lastFourDigits: '4242',
      cardHolder: 'Jane Doe',
      expiryDate: '12/99',
    },
  },
};

describe('PaymentSummaryScreen', () => {
  it('renders the masked card and totals', async () => {
    await renderWithProviders(
      <PaymentSummaryScreen {...buildProps(jest.fn())} />,
      { preloadedState },
    );

    expect(screen.getByText('Audífonos Bluetooth x2')).toBeTruthy();
    expect(screen.getByText('•••• •••• •••• 4242')).toBeTruthy();
  });

  it('submits the payment and navigates to TransactionResult', async () => {
    const navigate = jest.fn();
    const { store } = await renderWithProviders(
      <PaymentSummaryScreen {...buildProps(navigate)} />,
      { preloadedState },
    );

    fireEvent.press(screen.getByText('Pagar'));
    jest.advanceTimersByTime(800);

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('TransactionResult');
    });
    expect(store.getState().transaction.status).toBe('APPROVED');
  });
});
