export const CURRENCY = "BDT";
export const CURRENCY_SYMBOL = "৳";
export const CURRENCY_CODE = "BDT";

export function formatMoney(value: number): string {
  const num = Number(value);
  if (!Number.isFinite(num)) return `${CURRENCY_SYMBOL}0.00`;
  return `${CURRENCY_SYMBOL}${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}