import { test } from "uvu";
import * as assert from "uvu/assert";
import {
  normalizeDuration,
  normalizeLength,
  normalizePercent,
} from "./nomalizers.js";

test("normalizeDuration - seconds", () => {
  assert.equal(normalizeDuration({ value: 1.2345, unit: "s" }), {
    value: 1.23,
    unit: "s",
  });
});

test("normalizeDuration - milliseconds", () => {
  assert.equal(normalizeDuration({ value: 123.4, unit: "ms" }), {
    value: 123,
    unit: "ms",
  });
});

test("normalizeDuration - other unit", () => {
  assert.equal(normalizeDuration({ value: 2.71828, unit: "m" } as any), {
    value: 2.72,
    unit: "m",
  });
});

test("normalizeLength - px", () => {
  assert.equal(normalizeLength({ value: 10.2, unit: "px" }), {
    value: 10,
    unit: "px",
  });
});

test("normalizeLength - vh/vw/em/rem", () => {
  assert.equal(normalizeLength({ value: 5.678, unit: "vh" }), {
    value: 5.68,
    unit: "vh",
  });
  assert.equal(normalizeLength({ value: 9.123, unit: "em" }), {
    value: 9.12,
    unit: "em",
  });
});

test("normalizePercent", () => {
  assert.equal(normalizePercent({ value: 12.3456, unit: "%" }), {
    value: 12.35,
    unit: "%",
  });
});
