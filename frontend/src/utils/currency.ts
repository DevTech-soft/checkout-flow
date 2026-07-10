export function formatCurrency(amountInCents: number, currency: string): string {
  const amount = amountInCents / 100;

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
