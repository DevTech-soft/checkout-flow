import { render, screen } from '@testing-library/react-native';
import CardBrandBadge from './CardBrandBadge';

describe('CardBrandBadge', () => {
  it('renders the Visa label', async () => {
    await render(<CardBrandBadge brand="VISA" />);

    expect(screen.getByText('VISA')).toBeTruthy();
  });

  it('renders the Mastercard label', async () => {
    await render(<CardBrandBadge brand="MASTERCARD" />);

    expect(screen.getByText('Mastercard')).toBeTruthy();
  });

  it('renders nothing for an unknown brand', async () => {
    const { toJSON } = await render(<CardBrandBadge brand="UNKNOWN" />);

    expect(toJSON()).toBeNull();
  });
});
