jest.mock('@services/api/httpClient', () => ({
  ...jest.requireActual('@services/api/httpClient'),
  httpClient: { get: jest.fn(), post: jest.fn() },
}));

import { ApiError, httpClient } from '@services/api/httpClient';
import { getProductById, getProducts } from './productService';
import type { Product } from './product.types';

const mockedHttpClient = httpClient as jest.Mocked<typeof httpClient>;

const product: Product = {
  id: '1',
  name: 'Audífonos Bluetooth',
  description: 'Audífonos inalámbricos con cancelación de ruido.',
  priceInCents: 12000000,
  currency: 'COP',
  stock: 10,
  imageUrl: 'https://placehold.co/400x400?text=Audifonos',
};

describe('productService', () => {
  beforeEach(() => {
    mockedHttpClient.get.mockReset();
  });

  it('fetches the product catalog from the backend', async () => {
    mockedHttpClient.get.mockResolvedValue([product]);

    const products = await getProducts();

    expect(products).toEqual([product]);
    expect(mockedHttpClient.get).toHaveBeenCalledWith('/products');
  });

  it('fetches a product by id from the backend', async () => {
    mockedHttpClient.get.mockResolvedValue(product);

    const result = await getProductById('1');

    expect(result).toEqual(product);
    expect(mockedHttpClient.get).toHaveBeenCalledWith('/products/1');
  });

  it('returns null when the backend responds with 404', async () => {
    mockedHttpClient.get.mockRejectedValue(new ApiError('Not found', 404));

    const result = await getProductById('unknown-id');

    expect(result).toBeNull();
  });

  it('rethrows non-404 errors', async () => {
    mockedHttpClient.get.mockRejectedValue(new ApiError('Server error', 500));

    await expect(getProductById('1')).rejects.toThrow('Server error');
  });
});
