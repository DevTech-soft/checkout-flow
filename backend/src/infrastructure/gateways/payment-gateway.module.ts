import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PaymentGatewayPort } from '@application/ports/payment-gateway.port';
import { PaymentGatewayAdapter } from './payment-gateway.adapter';
import { PaymentGatewayClient } from './payment-gateway.client';
import { PaymentGatewayWebhookVerifier } from './payment-gateway-webhook.verifier';

@Module({
  imports: [HttpModule],
  providers: [
    PaymentGatewayClient,
    PaymentGatewayWebhookVerifier,
    { provide: PaymentGatewayPort, useClass: PaymentGatewayAdapter },
  ],
  exports: [PaymentGatewayPort, PaymentGatewayWebhookVerifier],
})
export class PaymentGatewayModule {}
