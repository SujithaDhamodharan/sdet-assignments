import { describe, it, expect, beforeEach } from 'vitest';
import { TestEnvironment } from './helpers/TestEnvironment';
import { SubscriptionBuilder } from './builders/SubscriptionBuilder';
import { WebhookPayloadBuilder } from './builders/WebhookPayloadBuilder';
import { SubscriptionStatus } from '../src/domain/Types';

describe('2. State-Machine & Lifecycle Suite', () => {
  let env: TestEnvironment;

  beforeEach(() => {
    env = new TestEnvironment();
  });

  it('transitions trialing -> active upon payment.succeeded webhook', async () => {
    const sub = new SubscriptionBuilder().withStatus(SubscriptionStatus.TRIALING).build();
    env.repository.saveSubscription(sub);

    const payload = new WebhookPayloadBuilder().withSubscriptionId(sub.id).withType('payment.succeeded').buildString();
    const sig = env.signer.sign(payload);

    await env.client.postWebhook(payload, sig);

    const updated = env.repository.getSubscription(sub.id);
    expect(updated?.status).toBe(SubscriptionStatus.ACTIVE);
  });

  it('INVARIANT: ignores payment.succeeded on canceled subscription (canceled -> active forbidden)', async () => {
    const sub = new SubscriptionBuilder().withStatus(SubscriptionStatus.CANCELED).build();
    env.repository.saveSubscription(sub);

    const payload = new WebhookPayloadBuilder().withSubscriptionId(sub.id).withType('payment.succeeded').buildString();
    const sig = env.signer.sign(payload);

    await env.client.postWebhook(payload, sig);

    const updated = env.repository.getSubscription(sub.id);
    expect(updated?.status).toBe(SubscriptionStatus.CANCELED);
  });

  it('rejects explicit API cancellation on an already canceled subscription', async () => {
    const sub = new SubscriptionBuilder().withStatus(SubscriptionStatus.CANCELED).build();
    env.repository.saveSubscription(sub);

    const res = await env.client.cancelSubscription(sub.id);
    expect(res.statusCode).toBe(500);
  });
});