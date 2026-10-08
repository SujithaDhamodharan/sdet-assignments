import crypto from 'node:crypto';

export class WebhookSigner {
  private readonly secret: string;

  constructor(secret: string = 'whsec_test_secret_123') {
    this.secret = secret;
  }

  sign(payload: object | string): string {
    const raw = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return crypto.createHmac('sha256', this.secret).update(raw).digest('hex');
  }

  verify(payload: object | string, signature: string): boolean {
    if (!signature) return false;

    const expected = this.sign(payload);
    const expectedBuf = Buffer.from(expected);
    const sigBuf = Buffer.from(signature);

    if (expectedBuf.length !== sigBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, sigBuf);
  }
}