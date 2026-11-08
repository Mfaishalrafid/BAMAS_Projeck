export const roles = ["DONOR", "CAMPAIGNER", "ADMIN"] as const;
export type Role = (typeof roles)[number];
export interface Actor {
  id: string;
  role: Role;
  name: string;
  email: string;
}
export function isRole(value: unknown): value is Role {
  return typeof value === "string" && roles.some((role) => role === value);
}
export function canCreateCampaign(actor: Actor) {
  return actor.role === "CAMPAIGNER" || actor.role === "ADMIN";
}
export function canReadCampaign(
  actor: Actor | null,
  ownerId: string,
  status: string,
) {
  return (
    status === "ACTIVE" || actor?.id === ownerId || actor?.role === "ADMIN"
  );
}
export function canEditDraft(actor: Actor, ownerId: string, status: string) {
  return canCreateCampaign(actor) && actor.id === ownerId && status === "DRAFT";
}
