import { z } from "zod";
import fixtures from "@/features/campaigns/infrastructure/fixtures.json";
import type { Campaign } from "@/features/campaigns/domain/campaign";
import {
  donationSchema,
  type Donation,
} from "@/features/donations/domain/donation";
const integer = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
export const campaignSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: z.string(),
  image: z.url().refine((s) => s.startsWith("https://images.unsplash.com/")),
  organizer: z.string(),
  verified: z.boolean(),
  location: z.string(),
  target: integer.positive(),
  raised: integer,
  donors: integer,
  daysLeft: integer,
  urgent: z.boolean().optional(),
  status: z.enum(["active", "review", "rejected"]),
  submittedAt: z.string().optional(),
  mine: z.boolean().optional(),
  story: z.array(z.string()),
  updates: z.array(
    z.object({ date: z.string(), title: z.string(), body: z.string() }),
  ),
  supporters: z.array(
    z.object({
      name: z.string(),
      amount: integer,
      ago: z.string(),
      note: z.string().optional(),
    }),
  ),
});
export const demoSchema = z.object({
  version: z.literal(1),
  campaigns: z.array(campaignSchema).max(500),
  donations: z.array(donationSchema).max(2000),
  saved: z.array(z.string()).max(500),
});
export type DemoState = {
  version: 1;
  campaigns: Campaign[];
  donations: Donation[];
  saved: string[];
};
export const initialState: DemoState = {
  version: 1,
  campaigns: fixtures.campaigns,
  donations: [
    {
      id: "seed-1",
      campaignId: "sembako-lansia",
      amount: 100000,
      method: "gopay",
      anonymous: false,
      note: "Untuk nenek dan kakek kita.",
      status: "paid",
      createdAt: Date.UTC(2026, 9, 28, 5, 12),
      code: "SIM-SEED1",
    },
    {
      id: "seed-2",
      campaignId: "air-sumba",
      amount: 50000,
      method: "qris",
      anonymous: true,
      note: "",
      status: "paid",
      createdAt: Date.UTC(2026, 10, 1, 8, 30),
      code: "SIM-SEED2",
    },
  ],
  saved: [],
};
export type DemoAction =
  | { type: "hydrate"; state: DemoState }
  | { type: "save"; id: string }
  | { type: "createDonation"; donation: Donation }
  | { type: "pay" | "cancel"; id: string }
  | { type: "reset" };
export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "reset":
      return initialState;
    case "save":
      return {
        ...state,
        saved: state.saved.includes(action.id)
          ? state.saved.filter((id) => id !== action.id)
          : [...state.saved, action.id],
      };
    case "createDonation": {
      const parsed = donationSchema.safeParse(action.donation);
      if (
        !parsed.success ||
        parsed.data.status !== "pending" ||
        state.donations.some((d) => d.id === parsed.data.id) ||
        !state.campaigns.some(
          (c) => c.id === parsed.data.campaignId && c.status === "active",
        )
      )
        return state;
      return { ...state, donations: [parsed.data, ...state.donations] };
    }
    case "pay":
    case "cancel": {
      const donation = state.donations.find((d) => d.id === action.id);
      if (!donation || donation.status !== "pending") return state;
      if (action.type === "cancel")
        return {
          ...state,
          donations: state.donations.map((d) =>
            d.id === donation.id ? { ...d, status: "cancelled" } : d,
          ),
        };
      const campaign = state.campaigns.find(
        (c) => c.id === donation.campaignId,
      );
      if (
        !campaign ||
        campaign.status !== "active" ||
        !Number.isSafeInteger(campaign.raised + donation.amount)
      )
        return state;
      return {
        ...state,
        donations: state.donations.map((d) =>
          d.id === donation.id ? { ...d, status: "paid" } : d,
        ),
        campaigns: state.campaigns.map((c) =>
          c.id === campaign.id
            ? {
                ...c,
                raised: c.raised + donation.amount,
                donors: c.donors + 1,
                supporters: [
                  {
                    name: donation.anonymous ? "Orang baik" : "Aulia Rahman",
                    amount: donation.amount,
                    ago: "Baru saja",
                    note: donation.note,
                  },
                  ...c.supporters,
                ],
              }
            : c,
        ),
      };
    }
  }
}
