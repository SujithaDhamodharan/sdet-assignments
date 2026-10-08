import { describe, it, expect, beforeEach } from 'vitest';
import { TestEnvironment } from './helpers/TestEnvironment.js';

describe('5. Mock Provider Verification Suite', () => {
  let env: TestEnvironment;

  beforeEach(() => {
    env = new TestEnvironment();
  });

  it('verifies provider interactions and parameters on charging', async () => {
    const chargeReq = {
      customerId: 'cust_456',
      amountInCents: 4900,
      currency: 'USD',
      paymentMethodId: 'pm_card_mastercard',
      idempotencyKey: 'idem_key_001',
    };

    const result = await env.mockProvider.charge(chargeReq);

    expect(result.success).toBe(true);
    expect(env.mockProvider.calls.length).toBe(1);
    expect(env.mockProvider.calls[0].amountInCents).toBe(4900);
    expect(env.mockProvider.calls[0].customerId).toBe('cust_456');
  });

  it('handles provider gateway timeouts gracefully', async () => {
    env.mockProvider.shouldTimeout = true;

    await expect(
      env.mockProvider.charge({
        customerId: 'cust_456',
        amountInCents: 1000,
        currency: 'USD',
        paymentMethodId: 'pm_card_visa',
        idempotencyKey: 'idem_key_002',
      })
    ).rejects.toThrow('Payment Provider Gateway Timeout');
  });
});