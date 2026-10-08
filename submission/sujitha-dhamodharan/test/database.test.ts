import { describe, it, expect, beforeEach } from 'vitest';
import { TestEnvironment } from './helpers/TestEnvironment';
import { SubscriptionBuilder } from './builders/SubscriptionBuilder';
import { SubscriptionStatus } from '../src/domain/Types';
import { WebhookPayloadBuilder } from './builders/WebhookPayloadBuilder';

describe('4. Database Persistence Suite', () => {
  let env: TestEnvironment;

  beforeEach(() => {
    env = new TestEnvironment();
  });

  it('persists invoices and audit logs coherently on payment success', async () => {
    const sub = new SubscriptionBuilder().withStatus(SubscriptionStatus.TRIALING).build();    env.repository.saveSubscription(sub);

    const payload = new WebhookPayloadBuilder().withSubscriptionId(sub.id).withType('payment.succeeded').buildString();
    const sig = env.signer.sign(payload);

    const response = await env.client.postWebhook(payload, sig);

    const invoices = env.repository.getInvoicesForSubscription(sub.id);
    expect(invoices.length).toBe(1);
    expect(invoices[0].paid).toBe(true);

    const logs = env.repository.auditLogs.filter((l) => l.subscriptionId === sub.id);
    expect(logs.some((l) => l.action.includes('PROCESSED_WEBHOOK'))).toBe(true);
  });
});