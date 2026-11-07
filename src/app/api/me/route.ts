import { requireActor } from "@/features/auth/infrastructure/session";
import { endpoint, json } from "@/shared/server/http";
export function GET(request: Request) {
  return endpoint(async () => json({ user: await requireActor(request) }));
}
