import { getProductById, getProducts } from './productService';

describe('productService', () => {
  it('returns the full mock catalog', async () => {
    const products = await getProducts();

    expect(products.length).toBeGreaterThan(0);
  });

  it('returns a product by id', async () => {
    const products = await getProducts();

    const product = await getProductById(products[0].id);

    expect(product).toEqual(products[0]);
  });

  it('returns null for an unknown id', async () => {
    const product = await getProductById('unknown-id');

    expect(product).toBeNull();
  });
});
