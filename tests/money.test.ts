import { test } from "node:test";
import assert from "node:assert/strict";
import { isValidAmount } from "../src/shared/lib/money";
test("reject unsafe, fractional, negative and nonfinite monetary values", () => {
  for (const n of [0, -1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])
    assert.equal(isValidAmount(n), false);
  assert.equal(isValidAmount(10000), true);
});
