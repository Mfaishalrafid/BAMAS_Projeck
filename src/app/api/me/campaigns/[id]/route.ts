import { requireActor } from "@/features/auth/infrastructure/session";
import { draftSchema } from "@/features/accounts/application/contracts";
import { updateDraft } from "@/features/accounts/infrastructure/campaign-repository";
import {
  endpoint,
  json,
  readJson,
  requireSameOrigin,
} from "@/shared/server/http";
export function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return endpoint(async () => {
    requireSameOrigin(request);
    const actor = await requireActor(request);
    const { id } = await context.params;
    return json({
      campaign: await updateDraft(
        id,
        actor,
        draftSchema.parse(await readJson(request)),
      ),
    });
  });
}
