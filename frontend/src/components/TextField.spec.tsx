import { fireEvent, render, screen } from '@testing-library/react-native';
import TextField from './TextField';

describe('TextField', () => {
  it('renders the label and forwards text input changes', async () => {
    const onChangeText = jest.fn();
    await render(
      <TextField label="Nombre completo" value="" onChangeText={onChangeText} />,
    );

    expect(screen.getByText('Nombre completo')).toBeTruthy();

    fireEvent.changeText(screen.getByDisplayValue(''), 'Jane Doe');

    expect(onChangeText).toHaveBeenCalledWith('Jane Doe');
  });

  it('renders an error message when provided', async () => {
    await render(
      <TextField
        label="Correo"
        value=""
        onChangeText={jest.fn()}
        error="Correo inválido"
      />,
    );

    expect(screen.getByText('Correo inválido')).toBeTruthy();
  });
});
