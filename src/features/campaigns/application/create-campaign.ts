import { z } from "zod";
export const campaignInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(15, "Judul minimal 15 karakter agar jelas.")
    .max(150),
  category: z.enum([
    "bencana",
    "pendidikan",
    "kesehatan",
    "pangan",
    "lingkungan",
    "sosial",
  ]),
  target: z
    .number()
    .int()
    .min(1000000, "Target minimal Rp1.000.000.")
    .max(100000000000),
  days: z.number().int().min(1).max(365),
  location: z.string().trim().min(3, "Isi lokasi penerima manfaat.").max(150),
  image: z.url().refine((s) => s.startsWith("https://images.unsplash.com/")),
  story: z
    .string()
    .trim()
    .min(50, "Ceritakan lebih detail (minimal 50 karakter).")
    .max(10000),
  agree: z.literal(true, { error: "Centang pernyataan untuk mengajukan." }),
});
export type CampaignInput = z.infer<typeof campaignInputSchema>;
