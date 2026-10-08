import { Subscription, Invoice, WebhookEventRecord, AuditLog } from '../domain/Types';

export class InMemoryRepository {
  public subscriptions: Map<string, Subscription> = new Map();
  public invoices: Invoice[] = [];
  public webhookEvents: Map<string, WebhookEventRecord> = new Map();
  public auditLogs: AuditLog[] = [];

  clear(): void {
    this.subscriptions.clear();
    this.invoices = [];
    this.webhookEvents.clear();
    this.auditLogs = [];
  }

  saveSubscription(sub: Subscription): void {
    this.subscriptions.set(sub.id, { ...sub });
  }

  getSubscription(id: string): Subscription | undefined {
    const sub = this.subscriptions.get(id);
    return sub ? { ...sub } : undefined;
  }

  saveInvoice(invoice: Invoice): void {
    this.invoices.push({ ...invoice });
  }

  addInvoice(invoice: Invoice): void {
    this.saveInvoice(invoice);
  }

  getInvoicesForSubscription(subscriptionId: string): Invoice[] {
    return this.invoices.filter((i) => i.subscriptionId === subscriptionId);
  }

  hasProcessedWebhook(eventId: string): boolean {
    return this.webhookEvents.has(eventId);
  }

  recordWebhookEvent(eventId: string, eventType: string): void {
    this.webhookEvents.set(eventId, {
      eventId,
      eventType,
      processedAt: new Date(),
    });
  }

  addAuditLog(subscriptionId: string, action: string): void {
    this.auditLogs.push({
      id: `audit_${Math.random().toString(36).substring(2, 9)}`,
      subscriptionId,
      action,
      timestamp: new Date(),
    });
  }
}