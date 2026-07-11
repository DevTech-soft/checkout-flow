import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().uri().required(),
  PAYMENT_GATEWAY_BASE_URL: Joi.string().uri().required(),
  PAYMENT_GATEWAY_PUBLIC_KEY: Joi.string().required(),
  PAYMENT_GATEWAY_PRIVATE_KEY: Joi.string().required(),
  PAYMENT_GATEWAY_EVENTS_KEY: Joi.string().required(),
});
