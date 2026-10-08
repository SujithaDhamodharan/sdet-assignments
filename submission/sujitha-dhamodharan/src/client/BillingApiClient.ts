import { BillingService } from '../service/BillingService';
import { PlanTier } from '../domain/Types';

export interface ApiResponse<T = any> {
  statusCode: number;
  body?: T;
  error?: string;
}

export class BillingApiClient {
  constructor(private billingService: BillingService) {}

  async createSubscription(payload: {
    customer_id: string;
    plan: string;
    payment_method_id: string;
  }): Promise<ApiResponse> {
    try {
      if (!payload.customer_id || !payload.payment_method_id) {
        return { statusCode: 400, error: 'Missing required fields' };
      }

      const planKey = payload.plan?.toUpperCase() as PlanTier;
      if (!Object.values(PlanTier).includes(planKey)) {
        return { statusCode: 400, error: 'Invalid plan selection' };
      }

      const subscription = await this.billingService.createSubscription({
        customerId: payload.customer_id,
        plan: planKey,
        paymentMethodId: payload.payment_method_id
      });

      return { statusCode: 201, body: subscription };
    } catch (err: any) {
      return { statusCode: 400, error: err.message || 'Invalid request' };
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<ApiResponse> {
    try {
      const subscription = await this.billingService.cancelSubscription(subscriptionId);
      return { statusCode: 200, body: subscription };
    } catch (err: any) {
      return {
        statusCode: 500,
        error: err.message || 'Failed to cancel subscription'
      };
    }
  }

  async postWebhook(rawBody: string, signature: string): Promise<ApiResponse> {
    try {
      const result = await this.billingService.processWebhook(rawBody, signature);
      return { statusCode: 200, body: result };
    } catch (err: any) {
      const message = err?.message || String(err);

      if (
        message.includes('Invalid signature') || 
        message.includes('signature') || 
        err instanceof TypeError
      ) {
        return { statusCode: 401, error: 'Invalid signature' };
      }

      if (message.includes('404') || message.includes('not found')) {
        return { statusCode: 404, error: 'Subscription not found' };
      }

      return { statusCode: 400, error: message || 'Invalid webhook payload' };
    }
  }
}