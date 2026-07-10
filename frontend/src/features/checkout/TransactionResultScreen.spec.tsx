import { fireEvent, render, screen } from '@testing-library/react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import TransactionResultScreen from './TransactionResultScreen';
import type { RootStackParamList } from '@navigation/routes';

type Props = NativeStackScreenProps<RootStackParamList, 'TransactionResult'>;

function buildProps(
  reset: jest.Mock,
  params: RootStackParamList['TransactionResult'],
): Props {
  return {
    navigation: { reset } as unknown as Props['navigation'],
    route: { key: 'transaction-result', name: 'TransactionResult', params },
  };
}

describe('TransactionResultScreen', () => {
  it('shows a success message', async () => {
    await render(
      <TransactionResultScreen {...buildProps(jest.fn(), { status: 'success' })} />,
    );

    expect(screen.getByText('Pago exitoso')).toBeTruthy();
  });

  it('shows an error message', async () => {
    await render(
      <TransactionResultScreen {...buildProps(jest.fn(), { status: 'error' })} />,
    );

    expect(screen.getByText('No pudimos procesar tu pago')).toBeTruthy();
  });

  it('resets navigation to Home when going back', async () => {
    const reset = jest.fn();
    await render(
      <TransactionResultScreen {...buildProps(reset, { status: 'success' })} />,
    );

    await fireEvent.press(screen.getByText('Volver al inicio'));

    expect(reset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  });
});
