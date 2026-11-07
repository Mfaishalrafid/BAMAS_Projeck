import { requireAdmin } from "@/features/auth/infrastructure/session";
import { getDb } from "@/shared/server/db";
import { endpoint, json } from "@/shared/server/http";
export function GET(request: Request) {
  return endpoint(async () => {
    await requireAdmin(request);
    const db = getDb();
    const [users, campaigns] = await Promise.all([
      db.user.count(),
      db.campaign.count(),
    ]);
    return json({ users, campaigns });
  });
}
