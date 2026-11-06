import { test } from "node:test";
import assert from "node:assert/strict";
import {
  demoReducer,
  initialState,
} from "../src/features/demo/application/demo-state";
import type { CampaignInput } from "../src/features/campaigns/application/create-campaign";
import { findCampaigns } from "../src/features/campaigns/domain/campaign";
const input: CampaignInput = {
  title: "Bantuan sekolah untuk warga desa",
  category: "pendidikan",
  target: 1000000,
  days: 30,
  location: "Bandung",
  image: initialState.campaigns[0].image,
  story:
    "Anak-anak di desa membutuhkan perlengkapan sekolah untuk melanjutkan pendidikan mereka.",
  agree: true,
};
test("new campaigns stay hidden until demo approval; rejected cannot be reapproved", () => {
  const created = demoReducer(initialState, {
    type: "createCampaign",
    input,
    id: "new",
  });
  assert.equal(created.campaigns[0].status, "review");
  assert.equal(created.campaigns[0].mine, true);
  assert.equal(
    findCampaigns(created.campaigns, input.title, "semua", "terbaru").length,
    0,
  );
  const approved = demoReducer(created, {
    type: "reviewCampaign",
    id: "new",
    approve: true,
  });
  assert.equal(
    findCampaigns(approved.campaigns, input.title, "semua", "terbaru").length,
    1,
  );
  const rejected = demoReducer(created, {
    type: "reviewCampaign",
    id: "new",
    approve: false,
  });
  assert.equal(
    demoReducer(rejected, { type: "reviewCampaign", id: "new", approve: true })
      .campaigns[0].status,
    "rejected",
  );
  assert.equal(
    demoReducer(initialState, {
      type: "createCampaign",
      input: { ...input, target: -1 },
      id: "bad",
    }),
    initialState,
  );
});
