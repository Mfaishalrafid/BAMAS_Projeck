import "server-only";
import { getAuth } from "./auth";
import { isRole, type Actor } from "../domain/authorization";
import { HttpError } from "@/shared/server/http";
export async function currentActor(request: Request): Promise<Actor | null> {
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session || !isRole(session.user.role)) return null;
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
  };
}
export async function requireActor(request: Request) {
  const actor = await currentActor(request);
  if (!actor)
    throw new HttpError(
      401,
      "UNAUTHENTICATED",
      "Silakan masuk terlebih dahulu.",
    );
  return actor;
}
export async function requireAdmin(request: Request) {
  const actor = await requireActor(request);
  if (actor.role !== "ADMIN")
    throw new HttpError(403, "FORBIDDEN", "Akses admin diperlukan.");
  return actor;
}
