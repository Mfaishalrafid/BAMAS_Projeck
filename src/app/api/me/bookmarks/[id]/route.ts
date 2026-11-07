import { requireActor } from "@/features/auth/infrastructure/session";
import { getDb } from "@/shared/server/db";
import { endpoint, json, requireSameOrigin } from "@/shared/server/http";
export function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return endpoint(async () => {
    requireSameOrigin(request);
    const actor = await requireActor(request);
    const { id } = await context.params;
    await getDb().campaignBookmark.deleteMany({
      where: { userId: actor.id, campaignId: id },
    });
    return json({ saved: false });
  });
}
