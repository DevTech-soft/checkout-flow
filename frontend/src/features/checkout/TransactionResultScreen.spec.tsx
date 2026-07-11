import { fireEvent, screen } from '@testing-library/react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import TransactionResultScreen from './TransactionResultScreen';
import { renderWithProviders } from '../../tests/renderWithProviders';
import type { RootStackParamList } from '@navigation/routes';
import type { RootState } from '@redux/store';

type Props = NativeStackScreenProps<RootStackParamList, 'TransactionResult'>;

function buildProps(reset: jest.Mock): Props {
  return {
    navigation: { reset } as unknown as Props['navigation'],
    route: {
      key: 'transaction-result',
      name: 'TransactionResult',
      params: undefined,
    },
  };
}

function withTransaction(
  status: NonNullable<RootState['transaction']['status']>,
): Partial<RootState> {
  return {
    transaction: {
      id: 'txn-123',
      status,
      amountInCents: 24000000,
      currency: 'COP',
      items: [{ productId: '1', quantity: 2, unitPriceInCents: 12000000 }],
      createdAt: '2026-07-10T00:00:00.000Z',
      requestStatus: 'succeeded',
      error: null,
    },
    order: { items: [{ productId: '1', quantity: 2 }] },
    cart: { items: [{ productId: '2', quantity: 1 }] },
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
        token: 'tok_test_123',
      },
    },
  };
}

describe('TransactionResultScreen', () => {
  it('shows a success message', async () => {
    await renderWithProviders(
      <TransactionResultScreen {...buildProps(jest.fn())} />,
      { preloadedState: withTransaction('APPROVED') },
    );

    expect(screen.getByText('Pago exitoso')).toBeTruthy();
  });

  it('shows an error message', async () => {
    await renderWithProviders(
      <TransactionResultScreen {...buildProps(jest.fn())} />,
      { preloadedState: withTransaction('DECLINED') },
    );

    expect(screen.getByText('No pudimos procesar tu pago')).toBeTruthy();
  });

  it('clears the checkout state and resets navigation to Home when going back', async () => {
    const reset = jest.fn();
    const { store } = await renderWithProviders(
      <TransactionResultScreen {...buildProps(reset)} />,
      { preloadedState: withTransaction('APPROVED') },
    );

    await fireEvent.press(screen.getByText('Volver al inicio'));

    expect(reset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'Home' }],
    });
    const state = store.getState();
    expect(state.transaction.id).toBeNull();
    expect(state.order).toEqual({ items: [] });
    expect(state.cart).toEqual({ items: [] });
    expect(state.checkout.customer).toBeNull();
    expect(state.card.card).toBeNull();
  });
});
