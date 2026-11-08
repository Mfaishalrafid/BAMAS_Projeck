import { getDb } from "@/shared/server/db";
import {
  endpoint,
  json,
  readJson,
  requireSameOrigin,
} from "@/shared/server/http";
import { requireActor } from "@/features/auth/infrastructure/session";
import {
  draftSchema,
  pageSchema,
} from "@/features/accounts/application/contracts";
import {
  campaignDto,
  createDraft,
} from "@/features/accounts/infrastructure/campaign-repository";
export function GET(request: Request) {
  return endpoint(async () => {
    const query = new URL(request.url).searchParams;
    const page = pageSchema.parse(query.get("page") ?? undefined);
    const search = (query.get("q") ?? "").trim().slice(0, 150);
    const rows = await getDb().campaign.findMany({
      where: {
        status: "ACTIVE",
        ...(search
          ? { title: { contains: search, mode: "insensitive" as const } }
          : {}),
      },
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      skip: (page - 1) * 20,
      take: 21,
    });
    return json({
      items: rows.slice(0, 20).map(campaignDto),
      page,
      hasMore: rows.length > 20,
    });
  });
}
export function POST(request: Request) {
  return endpoint(async () => {
    requireSameOrigin(request);
    const actor = await requireActor(request);
    return json(
      {
        campaign: await createDraft(
          actor,
          draftSchema.parse(await readJson(request)),
        ),
      },
      201,
    );
  });
}
