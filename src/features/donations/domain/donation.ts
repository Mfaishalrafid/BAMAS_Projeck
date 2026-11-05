import { z } from "zod";
export const methods = [
  {
    id: "qris",
    label: "QRIS (semua e-wallet & m-banking)",
    short: "QR",
    group: "QRIS",
  },
  { id: "gopay", label: "GoPay", short: "GP", group: "E-wallet" },
  { id: "ovo", label: "OVO", short: "OV", group: "E-wallet" },
  { id: "dana", label: "DANA", short: "DA", group: "E-wallet" },
  { id: "shopeepay", label: "ShopeePay", short: "SP", group: "E-wallet" },
  {
    id: "bca",
    label: "BCA Virtual Account",
    short: "BCA",
    group: "Transfer bank (Virtual Account)",
  },
  {
    id: "mandiri",
    label: "Mandiri Virtual Account",
    short: "MDR",
    group: "Transfer bank (Virtual Account)",
  },
  {
    id: "bri",
    label: "BRI Virtual Account",
    short: "BRI",
    group: "Transfer bank (Virtual Account)",
  },
] as const;
export const donationInputSchema = z.object({
  campaignId: z.string().min(1),
  amount: z.number().int().min(10000).max(100000000),
  method: z.enum([
    "qris",
    "gopay",
    "ovo",
    "dana",
    "shopeepay",
    "bca",
    "mandiri",
    "bri",
  ]),
  anonymous: z.boolean(),
  note: z.string().max(280),
});
export const donationSchema = donationInputSchema.extend({
  id: z.string().min(1),
  status: z.enum(["pending", "paid", "cancelled"]),
  createdAt: z.number().int().nonnegative(),
  code: z.string().startsWith("SIM-"),
});
export type DonationInput = z.infer<typeof donationInputSchema>;
export type Donation = z.infer<typeof donationSchema>;
export function amountError(raw: string): string | null {
  if (!/^\d+$/.test(raw)) return "Masukkan nominal dalam rupiah bulat.";
  const n = Number(raw);
  return n < 10000
    ? "Minimal donasi Rp10.000."
    : n > 100000000
      ? "Maksimal Rp100.000.000 per transaksi."
      : !Number.isSafeInteger(n)
        ? "Nominal tidak valid."
        : null;
}
