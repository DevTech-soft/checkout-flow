import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PaymentGatewayPort } from '@application/ports/payment-gateway.port';
import { PaymentGatewayAdapter } from './payment-gateway.adapter';
import { PaymentGatewayClient } from './payment-gateway.client';

@Module({
  imports: [HttpModule],
  providers: [
    PaymentGatewayClient,
    { provide: PaymentGatewayPort, useClass: PaymentGatewayAdapter },
  ],
  exports: [PaymentGatewayPort],
})
export class PaymentGatewayModule {}
