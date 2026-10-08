import { InMemoryRepository } from './Repository';
import { PaymentProvider } from '../domain/PaymentProvider';
import { WebhookSigner } from './WebhookSigner';
import { StateFactory } from '../domain/SubscriptionState';
import { PLAN_CONFIGS, PlanTier, Subscription, SubscriptionStatus } from '../domain/Types';

export class BillingService {
  constructor(
    private repository: InMemoryRepository,
    private paymentProvider: PaymentProvider,
    private webhookSigner: WebhookSigner
  ) {}

  async createSubscription(params: { customerId: string; plan: PlanTier; paymentMethodId: string }): Promise<Subscription> {
    const planConfig = PLAN_CONFIGS[params.plan];
    if (!planConfig) {
      throw new Error(`Invalid plan: ${params.plan}`);
    }

    const now = new Date();
    const periodEnd = new Date(now);

    if (planConfig.trialDays > 0) {
      periodEnd.setDate(periodEnd.getDate() + planConfig.trialDays);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    const status = planConfig.trialDays > 0 ? SubscriptionStatus.TRIALING : SubscriptionStatus.ACTIVE;

    const subscription: Subscription = {
      id: `sub_${Math.random().toString(36).substring(2, 9)}`,
      customerId: params.customerId,
      plan: params.plan,
      status,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      createdAt: now,
      updatedAt: now
    };

    this.repository.saveSubscription(subscription);
    this.repository.addAuditLog(subscription.id, 'SUBSCRIPTION_CREATED');
    return subscription;
  }

  async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    const sub = this.repository.getSubscription(subscriptionId);
    if (!sub) {
      throw new Error('Subscription not found');
    }

    const state = StateFactory.getState(sub.status);
    if (!state.canTransitionTo(SubscriptionStatus.CANCELED)) {
      throw new Error(`Cannot transition from ${sub.status} to CANCELED`);
    }

    sub.status = SubscriptionStatus.CANCELED;
    sub.cancelAtPeriodEnd = true;
    sub.updatedAt = new Date();

    this.repository.saveSubscription(sub);
    this.repository.addAuditLog(sub.id, 'SUBSCRIPTION_CANCELED');
    return sub;
  }

  async processWebhook(rawBody: string, signature: string): Promise<{ success: boolean; reason?: string }> {
    if (!this.webhookSigner.verify(rawBody, signature)) {
      throw new Error('Invalid signature');
    }

    const payload = JSON.parse(rawBody);
    const { event_id, type, subscription_id, amount, invoice_id } = payload;

    if (this.repository.hasProcessedWebhook(event_id)) {
      return { success: true, reason: 'Duplicate event ignored' };
    }

    const sub = this.repository.getSubscription(subscription_id);
    if (!sub) {
      throw new Error('404: Webhook target subscription not found');
    }

    const state = StateFactory.getState(sub.status);

    if (type === 'payment.succeeded') {
      if (state.canTransitionTo(SubscriptionStatus.ACTIVE)) {
        sub.status = SubscriptionStatus.ACTIVE;
        sub.updatedAt = new Date();
        this.repository.saveSubscription(sub);
      }
      this.repository.saveInvoice({
        id: invoice_id || `inv_${Math.random().toString(36).substring(2, 9)}`,
        subscriptionId: sub.id,
        amountInCents: amount || 0,
        paid: true,
        createdAt: new Date()
      });
    } else if (type === 'payment.failed') {
      if (state.canTransitionTo(SubscriptionStatus.PAST_DUE)) {
        sub.status = SubscriptionStatus.PAST_DUE;
        sub.updatedAt = new Date();
        this.repository.saveSubscription(sub);
      }
      this.repository.saveInvoice({
        id: invoice_id || `inv_${Math.random().toString(36).substring(2, 9)}`,
        subscriptionId: sub.id,
        amountInCents: amount || 0,
        paid: false,
        createdAt: new Date()
      });
    }

    this.repository.recordWebhookEvent(event_id, type);
    this.repository.addAuditLog(sub.id, 'PROCESSED_WEBHOOK');
    return { success: true };
  }
}