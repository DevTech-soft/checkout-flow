import { fireEvent, render, screen } from '@testing-library/react-native';
import ProductCard from './ProductCard';
import type { Product } from '@services/products/product.types';

const product: Product = {
  id: '1',
  name: 'Mouse inalámbrico',
  description: 'Mouse ergonómico',
  priceInCents: 8900000,
  currency: 'COP',
  stock: 20,
  imageUrl: 'https://placehold.co/400x400?text=Mouse',
};

describe('ProductCard', () => {
  it('renders the product name and price', async () => {
    await render(<ProductCard product={product} onPress={jest.fn()} />);

    expect(screen.getByText('Mouse inalámbrico')).toBeTruthy();
    expect(screen.getByText(/89.000/)).toBeTruthy();
  });

  it('calls onPress when tapped', async () => {
    const onPress = jest.fn();
    await render(<ProductCard product={product} onPress={onPress} />);

    fireEvent.press(screen.getByRole('button', { name: 'Mouse inalámbrico' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
