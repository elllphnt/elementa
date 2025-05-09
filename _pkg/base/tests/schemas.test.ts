import { test } from "uvu";
import * as assert from "uvu/assert";
import { angleSchema, booleanSchema, styleDataSchemas } from "./schemas.js";

test("booleanSchema valid/invalid", () => {
  assert.ok(booleanSchema.isValidSync(true));
  assert.not.ok(booleanSchema.isValidSync("nope"));
});
test("angleSchema valid", () => {
  assert.ok(angleSchema.isValidSync({ value: 10, unit: "rad" }));
  assert.not.ok(angleSchema.isValidSync({ value: 5, unit: "px" }));
});
test("styleDataSchemas has String type", () => {
  assert.ok(styleDataSchemas.string.isValidSync("abc"));
});
