import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  AcceptanceTokenResponse,
  CreateGatewayTransactionPayload,
  GatewayTransactionResponse,
} from './payment-gateway.types';

@Injectable()
export class PaymentGatewayClient {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private get baseUrl(): string {
    return this.configService.get<string>('paymentGateway.baseUrl')!;
  }

  private get publicKey(): string {
    return this.configService.get<string>('paymentGateway.publicKey')!;
  }

  private get privateKey(): string {
    return this.configService.get<string>('paymentGateway.privateKey')!;
  }

  async getAcceptanceToken(): Promise<string> {
    const response = await firstValueFrom(
      this.httpService.get<AcceptanceTokenResponse>(
        `${this.baseUrl}/merchants/${this.publicKey}`,
      ),
    );
    return response.data.data.presigned_acceptance.acceptance_token;
  }

  async createTransaction(
    payload: CreateGatewayTransactionPayload,
  ): Promise<GatewayTransactionResponse['data']> {
    const response = await firstValueFrom(
      this.httpService.post<GatewayTransactionResponse>(
        `${this.baseUrl}/transactions`,
        payload,
        { headers: { Authorization: `Bearer ${this.privateKey}` } },
      ),
    );
    return response.data.data;
  }
}
