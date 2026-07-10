import { render, screen } from '@testing-library/react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import SplashScreen from './SplashScreen';
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
    await render(<SplashScreen {...buildProps(jest.fn())} />);

    expect(screen.getByText('Checkout Flow')).toBeTruthy();
  });

  it('navigates to Home after the splash delay', async () => {
    const replace = jest.fn();
    await render(<SplashScreen {...buildProps(replace)} />);

    jest.advanceTimersByTime(1200);

    expect(replace).toHaveBeenCalledWith('Home');
  });
});
