import { envValidationSchema } from './env.validation';

interface ValidatedEnv {
  NODE_ENV: string;
  PORT: number;
}

describe('envValidationSchema', () => {
  const validEnv = {
    DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
    PAYMENT_GATEWAY_BASE_URL: 'https://api-sandbox.co.uat.wompi.dev/v1',
    PAYMENT_GATEWAY_PUBLIC_KEY: 'pub_test',
    PAYMENT_GATEWAY_PRIVATE_KEY: 'prv_test',
    PAYMENT_GATEWAY_EVENTS_KEY: 'events_test',
    PAYMENT_GATEWAY_INTEGRITY_KEY: 'integrity_test',
  };

  const incompleteEnv = {
    DATABASE_URL: validEnv.DATABASE_URL,
    PAYMENT_GATEWAY_BASE_URL: validEnv.PAYMENT_GATEWAY_BASE_URL,
    PAYMENT_GATEWAY_PUBLIC_KEY: validEnv.PAYMENT_GATEWAY_PUBLIC_KEY,
    PAYMENT_GATEWAY_PRIVATE_KEY: validEnv.PAYMENT_GATEWAY_PRIVATE_KEY,
  };

  it('accepts a fully populated, valid environment', () => {
    const result = envValidationSchema.validate(validEnv);
    const value = result.value as ValidatedEnv;

    expect(result.error).toBeUndefined();
    expect(value.NODE_ENV).toBe('development');
    expect(value.PORT).toBe(3000);
  });

  it('rejects an environment missing a required payment gateway key', () => {
    const { error } = envValidationSchema.validate(incompleteEnv);

    expect(error?.message).toContain('PAYMENT_GATEWAY_EVENTS_KEY');
  });

  it('rejects an unknown NODE_ENV value', () => {
    const { error } = envValidationSchema.validate({
      ...validEnv,
      NODE_ENV: 'staging',
    });

    expect(error?.message).toContain('NODE_ENV');
  });

  it('rejects a DATABASE_URL that is not a valid URI', () => {
    const { error } = envValidationSchema.validate({
      ...validEnv,
      DATABASE_URL: 'not-a-uri',
    });

    expect(error?.message).toContain('DATABASE_URL');
  });
});
