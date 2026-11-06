export interface Campaign {
  id: string;
  title: string;
  category: string;
  image: string;
  organizer: string;
  verified: boolean;
  location: string;
  target: number;
  raised: number;
  donors: number;
  daysLeft: number;
  urgent?: boolean;
  status: string;
  submittedAt?: string;
  story: string[];
  updates: { date: string; title: string; body: string }[];
  supporters: { name: string; amount: number; ago: string; note?: string }[];
}
export function progress(c: Campaign) {
  return Math.min(100, Math.round((c.raised / c.target) * 100));
}
export function findCampaigns(
  campaigns: Campaign[],
  query: string,
  category: string,
  sort: string,
) {
  const q = query.trim().toLocaleLowerCase("id");
  const results = campaigns.filter(
    (c) =>
      c.status === "active" &&
      (category === "semua" || c.category === category) &&
      `${c.title} ${c.organizer} ${c.location}`
        .toLocaleLowerCase("id")
        .includes(q),
  );
  return sort === "mendesak"
    ? results.sort((a, b) => a.daysLeft - b.daysLeft)
    : sort === "hampir"
      ? results.sort((a, b) => progress(b) - progress(a))
      : results;
}
