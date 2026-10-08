import { describe, it, expect, beforeEach } from 'vitest';
import { TestEnvironment } from './helpers/TestEnvironment.js';

describe('1. API Validation Suite', () => {
  let env: TestEnvironment;

  beforeEach(() => {
    env = new TestEnvironment();
  });

  it('creates subscription successfully on valid payload', async () => {
    const res = await env.client.createSubscription({
      customer_id: 'cust_001',
      plan: 'pro',
      payment_method_id: 'pm_123',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('trialing');
    expect(res.body.id).toMatch(/^sub_/);
  });

  it('rejects subscription creation with invalid plan (400)', async () => {
    const res = await env.client.createSubscription({
      customer_id: 'cust_001',
      plan: 'invalid_plan' as any,
      payment_method_id: 'pm_123',
    });

    expect(res.statusCode).toBe(400);
    expect(res.error).toContain('Invalid plan selection');
  });

  it('rejects subscription creation with missing required fields (400)', async () => {
    const res = await env.client.createSubscription({
      customer_id: '',
      plan: 'basic',
      payment_method_id: 'pm_123',
    });

    expect(res.statusCode).toBe(400);
  });

  it('rejects webhooks with missing/invalid HMAC signature (401)', async () => {
    const payload = JSON.stringify({ event_id: 'evt_100', subscription_id: 'sub_1' });
    const res = await env.client.postWebhook(payload, 'invalid_signature');

    expect(res.statusCode).toBe(401);
  });
});