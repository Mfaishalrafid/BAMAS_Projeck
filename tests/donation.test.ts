import { test } from "node:test";
import assert from "node:assert/strict";
import {
  demoReducer,
  initialState,
} from "../src/features/demo/application/demo-state";
import {
  amountError,
  type Donation,
} from "../src/features/donations/domain/donation";
import { decodeDemo } from "../src/features/demo/infrastructure/storage";
const donation: Donation = {
  id: "test",
  campaignId: "banjir-garut",
  amount: 10000,
  method: "qris",
  anonymous: true,
  note: "Semoga pulih",
  status: "pending",
  createdAt: 1,
  code: "SIM-TEST",
};
test("payment is idempotent and cancelled donations cannot pay", () => {
  const pending = demoReducer(initialState, {
    type: "createDonation",
    donation,
  });
  const paid = demoReducer(pending, { type: "pay", id: "test" });
  assert.equal(
    paid.campaigns[0].raised,
    initialState.campaigns[0].raised + 10000,
  );
  assert.equal(paid.campaigns[0].supporters[0].name, "Orang baik");
  assert.equal(demoReducer(paid, { type: "pay", id: "test" }), paid);
  const cancelled = demoReducer(pending, { type: "cancel", id: "test" });
  assert.equal(demoReducer(cancelled, { type: "pay", id: "test" }), cancelled);
});
test("reject invalid amounts, methods and inactive campaign", () => {
  for (const raw of ["", "-10000", "1e4", "10000.5", "9999", "100000001"])
    assert.ok(amountError(raw));
  assert.equal(amountError("10000"), null);
  assert.equal(
    demoReducer(initialState, {
      type: "createDonation",
      donation: { ...donation, amount: 0 },
    }),
    initialState,
  );
  assert.equal(
    demoReducer(initialState, {
      type: "createDonation",
      donation: { ...donation, campaignId: "perahu-nelayan" },
    }),
    initialState,
  );
});
test("storage rejects malformed, duplicate and unsafe records", () => {
  assert.equal(decodeDemo("{"), initialState);
  assert.equal(decodeDemo('{"version":0}'), initialState);
  const duplicate = { ...initialState, donations: [donation, donation] };
  assert.equal(decodeDemo(JSON.stringify(duplicate)), initialState);
  assert.deepEqual(decodeDemo(JSON.stringify(initialState)), initialState);
});
