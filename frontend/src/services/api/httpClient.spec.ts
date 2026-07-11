import { ApiError, httpClient } from './httpClient';

describe('httpClient', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('resolves with the parsed JSON body on success', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: '1' }),
    }) as unknown as typeof fetch;

    const result = await httpClient.get<{ id: string }>('/products');

    expect(result).toEqual({ id: '1' });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/products',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('sends a JSON body on post requests', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ id: '1' }),
    }) as unknown as typeof fetch;

    await httpClient.post('/transactions', { productId: '1' });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/transactions',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ productId: '1' }),
      }),
    );
  });

  it('throws an ApiError with the backend message when the response is not ok', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ message: 'Product not found' }),
    }) as unknown as typeof fetch;

    await expect(httpClient.get('/products/missing')).rejects.toMatchObject({
      message: 'Product not found',
      status: 404,
    });
  });

  it('unwraps a nested message object from the backend error body', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: () =>
        Promise.resolve({
          message: { message: ['fullName should not be empty'] },
        }),
    }) as unknown as typeof fetch;

    await expect(httpClient.get('/transactions')).rejects.toMatchObject({
      message: 'fullName should not be empty',
    });
  });

  it('throws an ApiError with status 0 when the network request fails', async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new Error('network down'));

    await expect(httpClient.get('/products')).rejects.toBeInstanceOf(
      ApiError,
    );
    await expect(httpClient.get('/products')).rejects.toMatchObject({
      status: 0,
    });
  });
});
