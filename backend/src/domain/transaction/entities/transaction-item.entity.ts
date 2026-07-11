export class TransactionItem {
  constructor(
    public readonly productId: string,
    public readonly quantity: number,
    public readonly unitPriceInCents: number,
  ) {}
}
