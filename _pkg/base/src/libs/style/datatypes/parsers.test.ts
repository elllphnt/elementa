import { test } from "uvu";
import * as assert from "uvu/assert";
import {
  parseBoolean,
  parseColor,
  parseDimension,
  parsePercent,
  parseRatio,
} from "./parsers.js";

test("parseDimension valid/invalid", () => {
  assert.equal(parseDimension("10px")[0], { value: 10, unit: "px" });
  assert.ok(parseDimension("bad")[1]);
});
test("parseBoolean", () => {
  assert.equal(parseBoolean("true")[0], true);
  assert.ok(parseBoolean("oops")[1]);
});
test("parsePercent", () => {
  assert.equal(parsePercent("50%")[0]?.unit, "%");
});
test("parseRatio", () => {
  assert.equal(parseRatio("4/3")[0], [4, 3]);
});
test("parseColor rgb", () => {
  const [c] = parseColor("rgb(10 20 30 / 0.1)");
  assert.equal(c?.model, "rgb");
});
