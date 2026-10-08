# Subscription & Billing Service - Automated Test Suite

Automated test suite and test harness for validating a stateful Subscription & Billing Service. Built with TypeScript and Vitest.

---

## Folder Structure

```text
submission/sujitha-dhamodharan/
├── src/
│   ├── client/           # API Client wrapper returning standard HTTP status codes
│   ├── domain/           # State pattern interfaces, state factory, and domain types
│   ├── mock/             # Mock payment provider implementation
│   └── service/          # Core BillingService, InMemoryRepository, and WebhookSigner
├── test/
│   ├── builders/         # Test data builders for subscriptions and webhooks
│   ├── helpers/          # TestEnvironment setup and isolation helpers
│   ├── api.test.ts       # API endpoint integration tests
│   ├── database.test.ts  # Database persistence and audit log tests
│   ├── mock-provider.test.ts # Payment provider interaction tests
│   ├── state-machine.test.ts # State transition invariant tests
│   └── webhook-idempotency.test.ts # Duplicate webhook delivery tests
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md

Setup & Running Tests
1. Prerequisites
Node.js: v18 or higher recommended

npm: Installed with Node.js

2. Installation
Navigate into the submission directory and install dependencies:
cd submission/sujitha-dhamodharan
npm install

Run Test Suite
Execute all 11 test cases across all 5 test files:

PowerShell
npm test

Test Strategy & Coverage Summary:
API Integration Tests: Validates HTTP status codes (201, 400, 401, 404, 500), request payload requirements, and HMAC signature verification.State Machine 
Invariants: Tests allowed state transitions (TRIALING $\rightarrow$ ACTIVE $\rightarrow$ PAST_DUE $\rightarrow$ CANCELED) and blocks invalid transitions (e.g., reactivating CANCELED).
Database & Audit Trail: Ensures subscriptions, invoices, and audit log history are persisted accurately.
Webhook Idempotency: Guarantees that delivering duplicate event_id payloads does not create duplicate invoices or audit entries.

---

### Terminal Commands to Save and Push

Once saved, run these commands in your VS Code terminal at the root directory:

```powershell
git add submission/sujitha-dhamodharan/README.md
git commit -m "docs: format README headings and code blocks"
git push -u origin solution/sujitha-dhamodharan