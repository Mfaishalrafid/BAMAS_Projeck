import { readCampaign } from "@/features/accounts/infrastructure/campaign-repository";
import { currentActor } from "@/features/auth/infrastructure/session";
import { endpoint, json } from "@/shared/server/http";
export function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  return endpoint(async () => {
    const { slug } = await context.params;
    const actor = request.headers.has("cookie")
      ? await currentActor(request)
      : null;
    return json({ campaign: await readCampaign(slug, actor) });
  });
}
