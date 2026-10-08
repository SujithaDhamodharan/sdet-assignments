export interface ChargeRequest {
  customerId: string;
  amountInCents: number;
  currency: string;
  paymentMethodId: string;
  idempotencyKey: string;
}

export interface ChargeResult {
  success: boolean;
  transactionId?: string;
  errorCode?: string;
}

export interface PaymentProvider {
  charge(request: ChargeRequest): Promise<ChargeResult>;
}