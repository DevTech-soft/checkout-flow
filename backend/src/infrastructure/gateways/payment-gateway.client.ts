import { createHash } from 'node:crypto';
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

  private get integrityKey(): string {
    return this.configService.get<string>('paymentGateway.integrityKey')!;
  }

  private buildIntegritySignature(payload: CreateGatewayTransactionPayload): string {
    const raw = `${payload.reference}${payload.amount_in_cents}${payload.currency}${this.integrityKey}`;
    return createHash('sha256').update(raw).digest('hex');
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
        { ...payload, signature: this.buildIntegritySignature(payload) },
        { headers: { Authorization: `Bearer ${this.privateKey}` } },
      ),
    );
    return response.data.data;
  }

  async getTransaction(
    gatewayTransactionId: string,
  ): Promise<GatewayTransactionResponse['data']> {
    const response = await firstValueFrom(
      this.httpService.get<GatewayTransactionResponse>(
        `${this.baseUrl}/transactions/${gatewayTransactionId}`,
        { headers: { Authorization: `Bearer ${this.privateKey}` } },
      ),
    );
    return response.data.data;
  }
}
