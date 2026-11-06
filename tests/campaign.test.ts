import { test } from "node:test";
import assert from "node:assert/strict";
import fixtures from "../src/features/campaigns/infrastructure/fixtures.json";
import { findCampaigns } from "../src/features/campaigns/domain/campaign";
test("search excludes pending review and combines location/category filters", () => {
  assert.equal(
    findCampaigns(fixtures.campaigns, "perahu", "semua", "mendesak").length,
    0,
  );
  const rows = findCampaigns(
    fixtures.campaigns,
    "GARUT",
    "bencana",
    "mendesak",
  );
  assert.equal(rows.length, 1);
  assert.equal(rows[0].id, "banjir-garut");
  assert.equal(
    findCampaigns(fixtures.campaigns, "tidak-ada", "semua", "mendesak").length,
    0,
  );
});
