/** Monetary values in F1 are safe integer IDR, never floating-point currency. */
export function isValidAmount(value: number): boolean { return Number.isSafeInteger(value) && value > 0; }
export function rupiah(value: number): string { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value); }
