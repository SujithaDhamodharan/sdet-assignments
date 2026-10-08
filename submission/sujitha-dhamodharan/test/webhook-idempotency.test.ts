import { describe, it, expect, beforeEach } from 'vitest';
import { TestEnvironment } from './helpers/TestEnvironment.js';
import { SubscriptionBuilder } from './builders/SubscriptionBuilder.js';
import { WebhookPayloadBuilder } from './builders/WebhookPayloadBuilder.js';

describe('3. Webhook Idempotency Suite', () => {
  let env: TestEnvironment;

  beforeEach(() => {
    env = new TestEnvironment();
  });

  it('processes duplicate webhook exactly once (idempotent)', async () => {
    const sub = new SubscriptionBuilder().withStatus('trialing').build();
    env.repository.saveSubscription(sub);

    const payloadBuilder = new WebhookPayloadBuilder().withEventId('evt_unique_999').withSubscriptionId(sub.id);
    const payload = payloadBuilder.buildString();
    const sig = env.signer.sign(payload);

    const res1 = await env.client.postWebhook(payload, sig);
    expect(res1.statusCode).toBe(200);

    const res2 = await env.client.postWebhook(payload, sig);
    expect(res2.statusCode).toBe(200);
    expect(res2.body.reason).toBe('Duplicate event ignored');

    const invoices = env.repository.getInvoicesForSubscription(sub.id);
    expect(invoices.length).toBe(1);
  });
});