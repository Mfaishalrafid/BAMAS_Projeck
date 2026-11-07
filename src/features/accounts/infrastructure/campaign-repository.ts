import "server-only";
import { randomUUID } from "node:crypto";
import { getDb } from "@/shared/server/db";
import { HttpError } from "@/shared/server/http";
import {
  canCreateCampaign,
  canReadCampaign,
  canEditDraft,
  type Actor,
} from "@/features/auth/domain/authorization";
import type { DraftInput } from "../application/contracts";
import type { Campaign } from "@/generated/prisma/client";
export function campaignDto(c: Campaign) {
  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    category: c.category,
    story: c.story,
    location: c.location,
    image: c.image,
    targetIdr: c.targetIdr.toString(),
    durationDays: c.durationDays,
    status: c.status,
    createdAt: c.createdAt.toISOString(),
  };
}
export async function createDraft(actor: Actor, input: DraftInput) {
  if (!canCreateCampaign(actor))
    throw new HttpError(403, "FORBIDDEN", "Akses penggalang dana diperlukan.");
  const id = randomUUID();
  return campaignDto(
    await getDb().campaign.create({
      data: {
        ...input,
        id,
        slug: id,
        ownerId: actor.id,
        targetIdr: BigInt(input.targetIdr),
        status: "DRAFT",
      },
    }),
  );
}
export async function readCampaign(slug: string, actor: Actor | null) {
  const c = await getDb().campaign.findUnique({ where: { slug } });
  if (!c || !canReadCampaign(actor, c.ownerId, c.status))
    throw new HttpError(404, "NOT_FOUND", "Kampanye tidak ditemukan.");
  return campaignDto(c);
}
export async function updateDraft(id: string, actor: Actor, input: DraftInput) {
  const db = getDb();
  const c = await db.campaign.findUnique({ where: { id } });
  if (!c || c.ownerId !== actor.id)
    throw new HttpError(404, "NOT_FOUND", "Kampanye tidak ditemukan.");
  if (!canEditDraft(actor, c.ownerId, c.status))
    throw new HttpError(
      403,
      "FORBIDDEN",
      "Hanya draft milik penggalang yang dapat diubah.",
    );
  const result = await db.campaign.updateMany({
    where: { id, ownerId: actor.id, status: "DRAFT" },
    data: { ...input, targetIdr: BigInt(input.targetIdr) },
  });
  if (result.count !== 1)
    throw new HttpError(
      409,
      "STATE_CONFLICT",
      "Status kampanye berubah. Muat ulang.",
    );
  return readCampaign(c.slug, actor);
}
