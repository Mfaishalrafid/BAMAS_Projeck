import { requireActor } from "@/features/auth/infrastructure/session";
import { getDb } from "@/shared/server/db";
import { bookmarkSchema } from "@/features/accounts/application/contracts";
import { campaignDto } from "@/features/accounts/infrastructure/campaign-repository";
import {
  endpoint,
  json,
  readJson,
  requireSameOrigin,
  HttpError,
} from "@/shared/server/http";
export function GET(request: Request) {
  return endpoint(async () => {
    const actor = await requireActor(request);
    const rows = await getDb().campaignBookmark.findMany({
      where: { userId: actor.id, campaign: { status: "ACTIVE" } },
      include: { campaign: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return json({ items: rows.map((row) => campaignDto(row.campaign)) });
  });
}
export function POST(request: Request) {
  return endpoint(async () => {
    requireSameOrigin(request);
    const actor = await requireActor(request);
    const { campaignId } = bookmarkSchema.parse(await readJson(request));
    const db = getDb();
    const campaign = await db.campaign.findFirst({
      where: { id: campaignId, status: "ACTIVE" },
    });
    if (!campaign)
      throw new HttpError(404, "NOT_FOUND", "Kampanye tidak ditemukan.");
    await db.campaignBookmark.upsert({
      where: { userId_campaignId: { userId: actor.id, campaignId } },
      create: { userId: actor.id, campaignId },
      update: {},
    });
    return json({ saved: true });
  });
}
