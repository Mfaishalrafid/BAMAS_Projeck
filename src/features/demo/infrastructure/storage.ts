import {
  demoSchema,
  initialState,
  type DemoState,
} from "../application/demo-state";
export const STORAGE_KEY = "bamas-f1-simulation-v1";
export function decodeDemo(raw: string | null): DemoState {
  if (!raw || raw.length > 2_000_000) return initialState;
  try {
    const result = demoSchema.safeParse(JSON.parse(raw));
    if (!result.success) return initialState;
    const s = result.data;
    if (
      new Set(s.campaigns.map((c) => c.id)).size !== s.campaigns.length ||
      new Set(s.donations.map((d) => d.id)).size !== s.donations.length ||
      s.donations.some((d) => !s.campaigns.some((c) => c.id === d.campaignId))
    )
      return initialState;
    return s;
  } catch {
    return initialState;
  }
}
