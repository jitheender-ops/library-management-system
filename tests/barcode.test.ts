import { test } from "node:test";
import assert from "node:assert/strict";
import { generateBarcodeSvgPattern, getDaysRemaining } from "../src/utils/barcode.ts";

test("barcode pattern is deterministic with guards", () => {
  const a = generateBarcodeSvgPattern("978013235");
  assert.deepEqual(a, generateBarcodeSvgPattern("978013235"));
  assert.deepEqual(a.slice(0, 4), [2, 1, 2, 1]);
  assert.deepEqual(a.slice(-4), [2, 1, 2, 2]);
});

test("getDaysRemaining is positive for future and negative for past", () => {
  assert.ok(getDaysRemaining(new Date(Date.now() + 3 * 864e5).toISOString()) >= 3);
  assert.ok(getDaysRemaining(new Date(Date.now() - 3 * 864e5).toISOString()) <= -2);
});
