export default () => ({
  nodeEnv: process.env.NODE_ENV,
  port: parseInt(process.env.PORT ?? '3000', 10),
  databaseUrl: process.env.DATABASE_URL,
  paymentGateway: {
    baseUrl: process.env.PAYMENT_GATEWAY_BASE_URL,
    publicKey: process.env.PAYMENT_GATEWAY_PUBLIC_KEY,
    privateKey: process.env.PAYMENT_GATEWAY_PRIVATE_KEY,
  },
});
