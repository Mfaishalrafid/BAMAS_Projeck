/** Monetary values in F1 are safe integer IDR, never floating-point currency. */
export function isValidAmount(value: number): boolean {
  return Number.isSafeInteger(value) && value > 0;
}
export function rupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function compactRupiah(value: number): string {
  return value >= 1e9
    ? `Rp${(value / 1e9).toLocaleString("id-ID", { maximumFractionDigits: 1 })} M`
    : value >= 1e6
      ? `Rp${(value / 1e6).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`
      : rupiah(value);
}
