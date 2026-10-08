export enum PlanTier {
  FREE = 'FREE',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE'
}

export enum SubscriptionStatus {
  TRIALING = 'trialing',
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled'
}

export interface PlanConfig {
  id: PlanTier;
  name: string;
  priceInCents: number;
  trialDays: number;
}

export const PLAN_CONFIGS: Record<PlanTier, PlanConfig> = {
  [PlanTier.FREE]: { id: PlanTier.FREE, name: 'Free Plan', priceInCents: 0, trialDays: 0 },
  [PlanTier.PRO]: { id: PlanTier.PRO, name: 'Pro Plan', priceInCents: 2900, trialDays: 14 },
  [PlanTier.ENTERPRISE]: { id: PlanTier.ENTERPRISE, name: 'Enterprise Plan', priceInCents: 9900, trialDays: 30 }
};

export interface Subscription {
  id: string;
  customerId: string;
  plan: PlanTier;
  status: SubscriptionStatus;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  amountInCents: number;
  paid: boolean;
  createdAt: Date;
}

export interface WebhookEventRecord {
  eventId: string;
  eventType: string;
  processedAt: Date;
}

export interface AuditLog {
  id: string;
  subscriptionId: string;
  action: string;
  timestamp: Date;
}