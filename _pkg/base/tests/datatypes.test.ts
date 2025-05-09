import { test } from "uvu";
import * as assert from "uvu/assert";
import { StyleDataType } from "../../../types/_primitives/style/datatypes.js";
import {
  getStyleDataType,
  normalizeStyleData,
  parseStyleData,
  stringifyFlexibleStyleData,
  stringifyStyleData,
  validateStyleData,
} from "./datatypes.js";

test("parseStyleData - Length", () => {
  const [val, err] = parseStyleData(StyleDataType.Length, "10px");
  assert.equal(val, { value: 10, unit: "px" });
  assert.is(err, undefined);
});

test("parseStyleData - Boolean", () => {
  const [val, err] = parseStyleData(StyleDataType.Boolean, "false");
  assert.equal(val, false);
  assert.is(err, undefined);
});

test("getStyleDataType / validateStyleData", () => {
  const p = { value: 50, unit: "%" };
  assert.equal(getStyleDataType(p), StyleDataType.Percent);
  assert.ok(validateStyleData(StyleDataType.Percent, p));
  assert.not.ok(validateStyleData(StyleDataType.Length, p));
});

test("stringifyStyleData / stringifyFlexibleStyleData", () => {
  assert.is(
    stringifyStyleData(StyleDataType.Length, { value: 5, unit: "em" }),
    "5em"
  );
  assert.is(
    stringifyFlexibleStyleData(
      { value: 20, unit: "%" },
      StyleDataType.Length,
      StyleDataType.Percent
    ),
    "20%"
  );
});

test("normalizeStyleData - Length", () => {
  const out = normalizeStyleData(StyleDataType.Length, {
    value: 1.234,
    unit: "vh",
  });
  assert.equal(out, { value: 1.23, unit: "vh" });
});
