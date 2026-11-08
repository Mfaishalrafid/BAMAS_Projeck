import { test } from "node:test";
import assert from "node:assert/strict";
import {
  canCreateCampaign,
  canEditDraft,
  canReadCampaign,
  isRole,
  type Actor,
} from "../src/features/auth/domain/authorization";
import { draftSchema } from "../src/features/accounts/application/contracts";
const actor: Actor = {
  id: "owner",
  name: "Test",
  email: "test@example.test",
  role: "CAMPAIGNER",
};
test("authorization denies unknown roles and editing another owner's draft", () => {
  assert.equal(isRole("SUPERADMIN"), false);
  assert.equal(canCreateCampaign({ ...actor, role: "DONOR" }), false);
  assert.equal(canEditDraft(actor, "other", "DRAFT"), false);
  assert.equal(canEditDraft(actor, actor.id, "ACTIVE"), false);
  assert.equal(canEditDraft(actor, actor.id, "DRAFT"), true);
  assert.equal(canReadCampaign(null, actor.id, "DRAFT"), false);
  assert.equal(canReadCampaign(null, actor.id, "ACTIVE"), true);
});
test("malformed money is a validation failure, never a BigInt exception", () => {
  const draft = {
    title: "Bantuan pendidikan desa",
    story: "Bantuan perlengkapan untuk anak sekolah di desa terpencil.",
    category: "pendidikan",
    location: "Bandung",
    image: "https://images.unsplash.com/example",
    durationDays: 30,
    targetIdr: "1000000",
  };
  for (const targetIdr of [
    "",
    "abc",
    "1000000.5",
    "-1000000",
    "0",
    "100000000001",
    "1e6",
  ]) {
    assert.equal(draftSchema.safeParse({ ...draft, targetIdr }).success, false);
  }
  assert.equal(draftSchema.safeParse(draft).success, true);
  assert.equal(
    draftSchema.safeParse({ ...draft, ownerId: "forged" }).success,
    false,
  );
});
