jest.mock('@redux/persistence/persistedState', () => ({
  loadPersistedState: jest.fn().mockResolvedValue(null),
}));

import { act, screen } from '@testing-library/react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import SplashScreen from './SplashScreen';
import { renderWithProviders } from '../../tests/renderWithProviders';
import type { RootStackParamList } from '@navigation/routes';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

jest.useFakeTimers();

function buildProps(replace: jest.Mock): Props {
  return {
    navigation: { replace } as unknown as Props['navigation'],
    route: { key: 'splash', name: 'Splash', params: undefined },
  };
}

describe('SplashScreen', () => {
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
});
