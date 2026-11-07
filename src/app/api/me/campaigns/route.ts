import { requireActor } from "@/features/auth/infrastructure/session";
import { getDb } from "@/shared/server/db";
import { endpoint, json } from "@/shared/server/http";
import { campaignDto } from "@/features/accounts/infrastructure/campaign-repository";
export function GET(request: Request) {
  return endpoint(async () => {
    const actor = await requireActor(request);
    const rows = await getDb().campaign.findMany({
      where: { ownerId: actor.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return json({ items: rows.map(campaignDto) });
  });
}
