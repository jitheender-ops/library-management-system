import { test } from "node:test";
import assert from "node:assert/strict";
import { toLocalDateStr } from "../src/utils/date.ts";

test("toLocalDateStr uses local calendar date, zero-padded", () => {
  assert.equal(toLocalDateStr(new Date(2026, 0, 5, 0, 30)), "2026-01-05");
  assert.equal(toLocalDateStr(new Date(2026, 11, 31, 23, 59)), "2026-12-31");
});
