/**
 * @format
 */

import { render, screen } from '@testing-library/react-native';
import App from '../App';

test('renders the initial route without crashing', async () => {
  await render(<App />);

  expect(screen.getByText('Splash')).toBeTruthy();
});
