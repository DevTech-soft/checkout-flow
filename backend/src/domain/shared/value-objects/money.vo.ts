export class Money {
  private constructor(
    public readonly amountInCents: number,
    public readonly currency: string,
  ) {}

  static fromCents(amountInCents: number, currency: string): Money {
    if (!Number.isInteger(amountInCents) || amountInCents < 0) {
      throw new Error('amountInCents must be a non-negative integer');
    }
    if (!currency) {
      throw new Error('currency is required');
    }
    return new Money(amountInCents, currency);
  }
}
