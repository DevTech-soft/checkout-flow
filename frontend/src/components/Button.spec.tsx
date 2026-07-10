import { fireEvent, render, screen } from '@testing-library/react-native';
import Button from './Button';

describe('Button', () => {
  it('calls onPress when pressed', async () => {
    const onPress = jest.fn();
    await render(<Button title="Continuar" onPress={onPress} />);

    fireEvent.press(screen.getByText('Continuar'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', async () => {
    const onPress = jest.fn();
    await render(<Button title="Continuar" onPress={onPress} disabled />);

    fireEvent.press(screen.getByText('Continuar'));

    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows a spinner instead of the title while loading', async () => {
    await render(<Button title="Continuar" onPress={jest.fn()} loading />);

    expect(screen.queryByText('Continuar')).toBeNull();
  });
});
