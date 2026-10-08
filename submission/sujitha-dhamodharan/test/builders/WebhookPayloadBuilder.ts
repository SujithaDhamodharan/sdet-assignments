export class WebhookPayloadBuilder {
  private payload = {
    event_id: `evt_${Math.random().toString(36).substring(2, 8)}`,
    type: 'payment.succeeded',
    subscription_id: 'sub_001',
    invoice_id: 'inv_001',
    amount: 4900,
    currency: 'USD',
  };

  withEventId(id: string): this {
    this.payload.event_id = id;
    return this;
  }

  withType(type: 'payment.succeeded' | 'payment.failed' | 'payment.refunded'): this {
    this.payload.type = type;
    return this;
  }

  withSubscriptionId(id: string): this {
    this.payload.subscription_id = id;
    return this;
  }

  buildString(): string {
    return JSON.stringify(this.payload);
  }
}