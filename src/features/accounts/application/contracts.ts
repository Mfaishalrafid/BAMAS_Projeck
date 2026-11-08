import { z } from "zod";
const money = z
  .string()
  .regex(/^[1-9]\d{0,11}$/)
  .refine(
    (value) =>
      /^[1-9]\d{0,11}$/.test(value) &&
      BigInt(value) >= 1000000n &&
      BigInt(value) <= 100000000000n,
    "Target Rp1.000.000–Rp100.000.000.000.",
  );
export const draftSchema = z
  .object({
    title: z.string().trim().min(15).max(150),
    category: z.enum([
      "bencana",
      "pendidikan",
      "kesehatan",
      "pangan",
      "lingkungan",
      "sosial",
    ]),
    story: z.string().trim().min(50).max(10000),
    location: z.string().trim().min(3).max(150),
    image: z
      .url()
      .refine((value) => value.startsWith("https://images.unsplash.com/")),
    targetIdr: money,
    durationDays: z.number().int().min(1).max(365),
  })
  .strict();
export const bookmarkSchema = z.object({ campaignId: z.uuid() }).strict();
export const pageSchema = z.coerce.number().int().min(1).max(1000).default(1);
export type DraftInput = z.infer<typeof draftSchema>;
