import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import PaymentSummaryScreen from './PaymentSummaryScreen';
import type { RootStackParamList } from '@navigation/routes';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentSummary'>;

jest.useFakeTimers();

function buildProps(navigate: jest.Mock): Props {
  return {
    navigation: { navigate } as unknown as Props['navigation'],
    route: {
      key: 'payment-summary',
      name: 'PaymentSummary',
      params: {
        productId: '1',
        quantity: 2,
        customer: {
          fullName: 'Jane Doe',
          email: 'jane@example.com',
          phoneNumber: '3001234567',
        },
        card: {
          brand: 'VISA',
          lastFourDigits: '4242',
          cardHolder: 'Jane Doe',
          expiryDate: '12/99',
        },
      },
    },
  };
}

describe('PaymentSummaryScreen', () => {
  it('renders the masked card and totals', async () => {
    await render(<PaymentSummaryScreen {...buildProps(jest.fn())} />);

    await waitFor(() => {
      expect(screen.getByText('Audífonos Bluetooth x2')).toBeTruthy();
    });
    expect(screen.getByText('•••• •••• •••• 4242')).toBeTruthy();
  });

  it('navigates to TransactionResult after paying', async () => {
    const navigate = jest.fn();
    await render(<PaymentSummaryScreen {...buildProps(navigate)} />);

    await waitFor(() => {
      expect(screen.getByText('Pagar')).toBeTruthy();
    });

    await fireEvent.press(screen.getByText('Pagar'));
    jest.advanceTimersByTime(800);

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('TransactionResult', {
        status: 'success',
      });
    });
  });
});
