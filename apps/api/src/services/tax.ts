const round2 = (value: number) => Math.round(value * 100) / 100;

/**
 * Splits a line-item sum into subtotal / tax / total.
 * With inclusive pricing the sum already contains tax (UAE-style shelf prices);
 * otherwise tax is added on top.
 */
export function computeTotals(lineSum: number, taxRate: number, pricesIncludeTax: boolean) {
  const sum = round2(lineSum);
  if (!taxRate) return { subtotal: sum, tax: 0, total: sum, taxRate: 0 };

  if (pricesIncludeTax) {
    const tax = round2(sum - sum / (1 + taxRate / 100));
    return { subtotal: round2(sum - tax), tax, total: sum, taxRate };
  }

  const tax = round2(sum * (taxRate / 100));
  return { subtotal: sum, tax, total: round2(sum + tax), taxRate };
}
