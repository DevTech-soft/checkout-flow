import { tokenizeCard } from './wompiClient';

describe('wompiClient', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  const input = {
    cardNumber: '4242 4242 4242 4242',
    cvv: '123',
    expiryDate: '12/29',
    cardHolder: 'Jane Doe',
  };

  it('tokenizes a card against the Wompi API using the public key', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({ status: 'CREATED', data: { id: 'tok_test_1' } }),
    }) as unknown as typeof fetch;

    const token = await tokenizeCard(input);

    expect(token).toBe('tok_test_1');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api-sandbox.co.uat.wompi.dev/v1/tokens/cards',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7',
        }),
        body: JSON.stringify({
          number: '4242424242424242',
          cvc: '123',
          exp_month: '12',
          exp_year: '29',
          card_holder: 'Jane Doe',
        }),
      }),
    );
  });

  it('throws with the gateway validation messages when tokenization is rejected', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () =>
        Promise.resolve({
          status: 'ERROR',
          error: { messages: { number: ['is not a valid card number'] } },
        }),
    }) as unknown as typeof fetch;

    await expect(tokenizeCard(input)).rejects.toThrow(
      'is not a valid card number',
    );
  });

  it('throws a generic message when the network request fails', async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new Error('network down'));

    await expect(tokenizeCard(input)).rejects.toThrow(
      'No pudimos validar tu tarjeta. Intenta nuevamente.',
    );
  });

  it('throws the gateway reason when there are no field-level messages', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () =>
        Promise.resolve({
          status: 'ERROR',
          error: { reason: 'INVALID_CARD' },
        }),
    }) as unknown as typeof fetch;

    await expect(tokenizeCard(input)).rejects.toThrow('INVALID_CARD');
  });

  it('throws a generic message when the response body cannot be parsed', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.reject(new Error('invalid json')),
    }) as unknown as typeof fetch;

    await expect(tokenizeCard(input)).rejects.toThrow(
      'No pudimos validar tu tarjeta. Verifica los datos e intenta de nuevo.',
    );
  });
});
