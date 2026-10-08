import {
  PlanTier,
  Subscription,
  SubscriptionStatus
} from '../../src/domain/Types';

export class SubscriptionBuilder {
  private subscription: Subscription = {
    id: `sub_test_${Math.random().toString(36).substring(2, 9)}`,
    customerId: 'customer_test',
    plan: PlanTier.PRO,
    status: SubscriptionStatus.TRIALING,
    currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    cancelAtPeriodEnd: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  withId(id: string): this {
    this.subscription.id = id;
    return this;
  }

  withCustomerId(customerId: string): this {
    this.subscription.customerId = customerId;
    return this;
  }

  withPlan(plan: PlanTier): this {
    this.subscription.plan = plan;
    return this;
  }

  withStatus(status: SubscriptionStatus): this {
    this.subscription.status = status;
    return this;
  }

  withCancelAtPeriodEnd(value: boolean): this {
    this.subscription.cancelAtPeriodEnd = value;
    return this;
  }

  build(): Subscription {
    return {
      ...this.subscription,
      createdAt: new Date(this.subscription.createdAt),
      updatedAt: new Date(this.subscription.updatedAt),
      currentPeriodEnd: new Date(this.subscription.currentPeriodEnd)
    };
  }
}