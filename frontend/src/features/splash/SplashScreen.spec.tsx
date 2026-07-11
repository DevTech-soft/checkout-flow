jest.mock('@redux/persistence/persistedState', () => ({
  ...jest.requireActual('@redux/persistence/persistedState'),
  loadPersistedState: jest.fn().mockResolvedValue(null),
}));

import { act, screen } from '@testing-library/react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import SplashScreen from './SplashScreen';
import { renderWithProviders } from '../../tests/renderWithProviders';
import { loadPersistedState } from '@redux/persistence/persistedState';
import type { RootStackParamList } from '@navigation/routes';

const mockedLoadPersistedState = loadPersistedState as jest.MockedFunction<
  typeof loadPersistedState
>;

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

jest.useFakeTimers();

function buildProps(replace: jest.Mock): Props {
  return {
    navigation: { replace } as unknown as Props['navigation'],
    route: { key: 'splash', name: 'Splash', params: undefined },
  };
}

describe('SplashScreen', () => {
  afterEach(() => {
    mockedLoadPersistedState.mockReset();
    mockedLoadPersistedState.mockResolvedValue(null);
  });

  it('renders the app title', async () => {
    await renderWithProviders(<SplashScreen {...buildProps(jest.fn())} />);

    expect(screen.getByText('Checkout Flow')).toBeTruthy();
  });

  it('navigates to Home after the splash delay', async () => {
    const replace = jest.fn();
    await renderWithProviders(<SplashScreen {...buildProps(replace)} />);

    await act(async () => {
      await Promise.resolve();
    });
    jest.advanceTimersByTime(1200);

    expect(replace).toHaveBeenCalledWith('Home');
  });

  it('hydrates the store when there is persisted state', async () => {
    mockedLoadPersistedState.mockResolvedValue({
      order: { productId: '1', quantity: 2 },
      checkout: {
        customer: {
          fullName: 'Jane Doe',
          email: 'jane@example.com',
          phoneNumber: '3001234567',
        },
      },
      transaction: {
        id: 'tx-1',
        status: 'APPROVED',
        amountInCents: 24000000,
        currency: 'COP',
        productId: '1',
        createdAt: '2026-07-10T00:00:00.000Z',
      },
    });
    const replace = jest.fn();
    const { store } = await renderWithProviders(
      <SplashScreen {...buildProps(replace)} />,
    );

    await act(async () => {
      await Promise.resolve();
    });
    jest.advanceTimersByTime(1200);

    expect(store.getState().order.productId).toBe('1');
    expect(replace).toHaveBeenCalledWith('Home');
  });

  it('still navigates to Home when loading persisted state fails', async () => {
    mockedLoadPersistedState.mockRejectedValue(new Error('storage down'));
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const replace = jest.fn();
    await renderWithProviders(<SplashScreen {...buildProps(replace)} />);

    await act(async () => {
      await Promise.resolve();
    });
    jest.advanceTimersByTime(1200);

    expect(warnSpy).toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith('Home');
    warnSpy.mockRestore();
  });
});
