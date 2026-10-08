import { PaymentProvider, ChargeRequest, ChargeResult } from '../domain/PaymentProvider.js';

export class MockPaymentProvider implements PaymentProvider {
  public calls: ChargeRequest[] = [];
  public shouldSucceed = true;
  public shouldTimeout = false;

  async charge(request: ChargeRequest): Promise<ChargeResult> {
    this.calls.push(request);

    if (this.shouldTimeout) {
      throw new Error('Payment Provider Gateway Timeout');
    }

    if (!this.shouldSucceed) {
      return { success: false, errorCode: 'card_declined' };
    }

    return {
      success: true,
      transactionId: `txn_${Math.random().toString(36).substring(2, 9)}`,
    };
  }

  reset(): void {
    this.calls = [];
    this.shouldSucceed = true;
    this.shouldTimeout = false;
  }
}