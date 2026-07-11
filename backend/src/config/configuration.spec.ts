import configuration from './configuration';

describe('configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('maps environment variables into the configuration object', () => {
    process.env.NODE_ENV = 'production';
    process.env.PORT = '4000';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.PAYMENT_GATEWAY_BASE_URL =
      'https://api-sandbox.co.uat.wompi.dev/v1';
    process.env.PAYMENT_GATEWAY_PUBLIC_KEY = 'pub_test';
    process.env.PAYMENT_GATEWAY_PRIVATE_KEY = 'prv_test';
    process.env.PAYMENT_GATEWAY_EVENTS_KEY = 'events_test';

    expect(configuration()).toEqual({
      nodeEnv: 'production',
      port: 4000,
      databaseUrl: 'postgresql://user:pass@localhost:5432/db',
      paymentGateway: {
        baseUrl: 'https://api-sandbox.co.uat.wompi.dev/v1',
        publicKey: 'pub_test',
        privateKey: 'prv_test',
        eventsKey: 'events_test',
      },
    });
  });

  it('defaults the port to 3000 when PORT is not set', () => {
    delete process.env.PORT;

    expect(configuration().port).toBe(3000);
  });
});
