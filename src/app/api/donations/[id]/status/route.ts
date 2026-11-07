import { requireActor } from "@/features/auth/infrastructure/session";
import { getDb } from "@/shared/server/db";
import { endpoint, json, HttpError } from "@/shared/server/http";
export function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return endpoint(async () => {
    const actor = await requireActor(request);
    const { id } = await context.params;
    const donation = await getDb().donation.findFirst({
      where: { id, donorId: actor.id },
      select: { id: true, status: true },
    });
    if (!donation)
      throw new HttpError(404, "NOT_FOUND", "Donasi tidak ditemukan.");
    return json({ donation });
  });
}
