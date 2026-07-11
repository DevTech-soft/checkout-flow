import { act } from 'react-test-renderer';
import { Text } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { ToastProvider, useToast } from './ToastProvider';

function TriggerButton({
  message,
  variant,
}: {
  message: string;
  variant?: 'success' | 'error';
}) {
  const { showToast } = useToast();
  return <Text onPress={() => showToast(message, variant)}>trigger</Text>;
}

describe('ToastProvider', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows a toast when showToast is called and hides it after the duration', async () => {
    await render(
      <ToastProvider>
        <TriggerButton message="Algo salió mal" />
      </ToastProvider>,
    );

    await fireEvent.press(screen.getByText('trigger'));

    expect(screen.getByText('Algo salió mal')).toBeTruthy();

    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(screen.queryByText('Algo salió mal')).toBeNull();
    });
  });

  it('throws when useToast is used outside of a ToastProvider', async () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    await expect(render(<TriggerButton message="oops" />)).rejects.toThrow(
      'useToast must be used within a ToastProvider',
    );

    consoleError.mockRestore();
  });
});
