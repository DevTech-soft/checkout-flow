import { fireEvent, screen } from '@testing-library/react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import CardFormScreen from './CardFormScreen';
import { renderWithProviders } from '../../tests/renderWithProviders';
import type { RootStackParamList } from '@navigation/routes';

type Props = NativeStackScreenProps<RootStackParamList, 'CardForm'>;

function buildProps(navigate: jest.Mock): Props {
  return {
    navigation: { navigate } as unknown as Props['navigation'],
    route: { key: 'card-form', name: 'CardForm', params: undefined },
  };
}

describe('CardFormScreen', () => {
  it('shows validation errors when submitting an empty form', async () => {
    const navigate = jest.fn();
    await renderWithProviders(<CardFormScreen {...buildProps(navigate)} />);

    await fireEvent.press(screen.getByText('Continuar'));

    expect(screen.getByText('Ingresa el nombre completo')).toBeTruthy();
    expect(
      screen.getByText('El número de tarjeta solo debe contener dígitos'),
    ).toBeTruthy();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('detects the Visa brand as the card number is typed', async () => {
    await renderWithProviders(<CardFormScreen {...buildProps(jest.fn())} />);

    await fireEvent.changeText(
      screen.getByLabelText('Número de tarjeta'),
      '4242424242424242',
    );

    expect(screen.getByText('VISA')).toBeTruthy();
  });

  it('stores a masked card summary and navigates to PaymentSummary', async () => {
    const navigate = jest.fn();
    const { store } = await renderWithProviders(
      <CardFormScreen {...buildProps(navigate)} />,
    );

    await fireEvent.changeText(
      screen.getByLabelText('Nombre en la tarjeta'),
      'Jane Doe',
    );
    await fireEvent.changeText(
      screen.getByLabelText('Número de tarjeta'),
      '4242424242424242',
    );
    await fireEvent.changeText(
      screen.getByLabelText('Vencimiento (MM/YY)'),
      '1299',
    );
    await fireEvent.changeText(screen.getByLabelText('CVV'), '123');

    await fireEvent.press(screen.getByText('Continuar'));

    expect(navigate).toHaveBeenCalledWith('PaymentSummary');
    expect(store.getState().card.card).toEqual({
      brand: 'VISA',
      lastFourDigits: '4242',
      cardHolder: 'Jane Doe',
      expiryDate: '12/99',
    });
  });
});
