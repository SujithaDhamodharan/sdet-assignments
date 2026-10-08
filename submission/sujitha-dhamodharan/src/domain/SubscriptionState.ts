import { SubscriptionStatus } from './Types';

export interface SubscriptionState {
  readonly status: SubscriptionStatus;
  canTransitionTo(nextStatus: SubscriptionStatus): boolean;
}

export class TrialingState implements SubscriptionState {
  readonly status = SubscriptionStatus.TRIALING;

  canTransitionTo(nextStatus: SubscriptionStatus): boolean {
    return [SubscriptionStatus.ACTIVE, SubscriptionStatus.CANCELED].includes(nextStatus);
  }
}

export class ActiveState implements SubscriptionState {
  readonly status = SubscriptionStatus.ACTIVE;

  canTransitionTo(nextStatus: SubscriptionStatus): boolean {
    return [SubscriptionStatus.PAST_DUE, SubscriptionStatus.CANCELED].includes(nextStatus);
  }
}

export class PastDueState implements SubscriptionState {
  readonly status = SubscriptionStatus.PAST_DUE;

  canTransitionTo(nextStatus: SubscriptionStatus): boolean {
    return [SubscriptionStatus.ACTIVE, SubscriptionStatus.CANCELED].includes(nextStatus);
  }
}

export class CanceledState implements SubscriptionState {
  readonly status = SubscriptionStatus.CANCELED;

  canTransitionTo(_nextStatus: SubscriptionStatus): boolean {
    return false;
  }
}

export class StateFactory {
  static getState(status: SubscriptionStatus | string): SubscriptionState {
    const normalizedStatus = (typeof status === 'string' ? status.toUpperCase() : status) as SubscriptionStatus;

    switch (normalizedStatus) {
      case SubscriptionStatus.TRIALING:
      case 'TRIALING':
        return new TrialingState();
      case SubscriptionStatus.ACTIVE:
      case 'ACTIVE':
        return new ActiveState();
      case SubscriptionStatus.PAST_DUE:
      case 'PAST_DUE':
        return new PastDueState();
      case SubscriptionStatus.CANCELED:
      case 'CANCELED':
        return new CanceledState();
      default:
        throw new Error(`Unknown status: ${status}`);
    }
  }

  static get(status: SubscriptionStatus | string): SubscriptionState {
    return this.getState(status);
  }
}