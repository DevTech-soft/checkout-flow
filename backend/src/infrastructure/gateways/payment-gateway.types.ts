export interface AcceptanceTokenResponse {
  data: {
    presigned_acceptance: {
      acceptance_token: string;
    };
  };
}

export interface CreateGatewayTransactionPayload {
  amount_in_cents: number;
  currency: string;
  customer_email: string;
  reference: string;
  acceptance_token: string;
  payment_method: {
    type: 'CARD';
    token: string;
    installments: number;
  };
}

export interface GatewayTransactionResponse {
  data: {
    id: string;
    status: string;
  };
}
