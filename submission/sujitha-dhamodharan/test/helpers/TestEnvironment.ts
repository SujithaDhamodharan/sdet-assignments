import { InMemoryRepository } from '../../src/service/Repository.js';
import { MockPaymentProvider } from '../../src/mock/MockPaymentProvider.js';
import { WebhookSigner } from '../../src/service/WebhookSigner.js';
import { BillingService } from '../../src/service/BillingService.js';
import { BillingApiClient } from '../../src/client/BillingApiClient.js';

export class TestEnvironment {
  public repository: InMemoryRepository;
  public mockProvider: MockPaymentProvider;
  public signer: WebhookSigner;
  public service: BillingService;
  public client: BillingApiClient;

  constructor() {
    this.repository = new InMemoryRepository();
    this.mockProvider = new MockPaymentProvider();
    this.signer = new WebhookSigner();
    this.service = new BillingService(this.repository, this.mockProvider, this.signer);
    this.client = new BillingApiClient(this.service);
  }

  reset(): void {
    this.repository.clear();
    this.mockProvider.reset();
  }
}