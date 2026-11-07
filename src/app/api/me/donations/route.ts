import { requireActor } from "@/features/auth/infrastructure/session";
import { getDb } from "@/shared/server/db";
import { endpoint, json } from "@/shared/server/http";
export function GET(request: Request) {
  return endpoint(async () => {
    const actor = await requireActor(request);
    const rows = await getDb().donation.findMany({
      where: { donorId: actor.id },
      select: {
        id: true,
        campaignId: true,
        amountIdr: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return json({
      items: rows.map((row) => ({
        ...row,
        amountIdr: row.amountIdr.toString(),
      })),
    });
  });
}
