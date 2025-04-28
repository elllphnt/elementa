import { test } from "uvu";
import * as assert from "uvu/assert";
import { ColorData, StyleDataType } from "../../../types/_.js";
import {
  stringifyAngle,
  stringifyColor,
  stringifyDimension,
  stringifyDuration,
  stringifyFlex,
  stringifyLength,
  stringifyPercent,
  stringifyRatio,
  styleDataStringifiers,
} from "./stringifiers.js";

// stringifyDimension

test("stringifyDimension", () => {
  assert.is(stringifyDimension({ value: 5, unit: "px" }), "5px");
});
test("stringifyDimension vh unit", () => {
  assert.is(
    stringifyDimension({ value: 5, unit: "vh" }),
    "calc(5 * var(--vh-unit))"
  );
});
test("stringifyDimension vw unit", () => {
  assert.is(
    stringifyDimension({ value: 5, unit: "vw" }),
    "calc(5 * var(--vw-unit))"
  );
});
test("stringify dimension based", () => {
  assert.is(stringifyAngle({ value: 30, unit: "deg" }), "30deg");
  assert.is(stringifyLength({ value: 15, unit: "px" }), "15px");
  assert.is(stringifyPercent({ value: 50, unit: "%" }), "50%");
  assert.is(stringifyDuration({ value: 2, unit: "s" }), "2s");
  assert.is(stringifyFlex({ value: 3, unit: "fr" }), "3fr");
});

test("stringifyRatio", () => {
  assert.is(stringifyRatio([1, 2]), "1 / 2");
});

test("stringifyColor", () => {
  // with alpha
  assert.is(
    stringifyColor({ model: "rgb", value: [1, 2, 3], alpha: 0.5 }),
    "rgb(1 2 3 / 0.5)"
  );
  assert.is(
    stringifyColor({ model: "hsl", value: [1, 2, 3], alpha: 0.5 }),
    "hsl(1 2 3 / 0.5)"
  );
  assert.is(
    stringifyColor({ model: "hwb", value: [1, 2, 3], alpha: 0.5 }),
    "hwb(1 2 3 / 0.5)"
  );
  assert.is(
    stringifyColor({ model: "lab", value: [1, 2, 3], alpha: 0.5 }),
    "lab(1 2 3 / 0.5)"
  );
  assert.is(
    stringifyColor({ model: "lch", value: [1, 2, 3], alpha: 0.5 }),
    "lch(1 2 3 / 0.5)"
  );
  assert.is(
    stringifyColor({ model: "oklab", value: [1, 2, 3], alpha: 0.5 }),
    "oklab(1 2 3 / 0.5)"
  );
  assert.is(
    stringifyColor({ model: "oklch", value: [1, 2, 3], alpha: 0.5 }),
    "oklch(1 2 3 / 0.5)"
  );

  // without alpha
  assert.is(stringifyColor({ model: "rgb", value: [1, 2, 3] }), "rgb(1 2 3)");
  assert.is(stringifyColor({ model: "hsl", value: [1, 2, 3] }), "hsl(1 2 3)");
  assert.is(stringifyColor({ model: "hwb", value: [1, 2, 3] }), "hwb(1 2 3)");
  assert.is(stringifyColor({ model: "lab", value: [1, 2, 3] }), "lab(1 2 3)");
  assert.is(stringifyColor({ model: "lch", value: [1, 2, 3] }), "lch(1 2 3)");
  assert.is(
    stringifyColor({ model: "oklab", value: [1, 2, 3] }),
    "oklab(1 2 3)"
  );
  assert.is(
    stringifyColor({ model: "oklch", value: [1, 2, 3] }),
    "oklch(1 2 3)"
  );
});
test("stringifiers mapping covers String", () => {
  assert.type(styleDataStringifiers[StyleDataType.String], "function");
});

// dimension special units
test("stringifyDimension vh unit", () => {
  assert.is(
    stringifyDimension({ value: 10, unit: "vh" }),
    "calc(10 * var(--vh-unit))"
  );
});
test("stringifyDimension vw unit", () => {
  assert.is(
    stringifyDimension({ value: 20, unit: "vw" }),
    "calc(20 * var(--vw-unit))"
  );
});

// angle, length, percent, duration, flex via mapping
test("stringifyAngle via mapping", () => {
  assert.is(
    styleDataStringifiers[StyleDataType.Angle]({ value: 30, unit: "deg" }),
    "30deg"
  );
});
test("stringifyLength via mapping", () => {
  assert.is(
    styleDataStringifiers[StyleDataType.Length]({ value: 15, unit: "px" }),
    "15px"
  );
});
test("stringifyPercent via mapping", () => {
  assert.is(
    styleDataStringifiers[StyleDataType.Percent]({ value: 50, unit: "%" }),
    "50%"
  );
});
test("stringifyDuration via mapping", () => {
  assert.is(
    styleDataStringifiers[StyleDataType.Duration]({ value: 2, unit: "s" }),
    "2s"
  );
});
test("stringifyFlex via mapping", () => {
  assert.is(
    styleDataStringifiers[StyleDataType.Flex]({ value: 3, unit: "fr" }),
    "3fr"
  );
});

// primitive types via mapping
test("stringifyBoolean via mapping", () => {
  assert.is(styleDataStringifiers[StyleDataType.Boolean](false), "false");
});
test("stringifyNumber via mapping", () => {
  assert.is(styleDataStringifiers[StyleDataType.Number](42), "42");
});
test("stringifyString via mapping", () => {
  assert.is(styleDataStringifiers[StyleDataType.String]("hello"), "hello");
});

// color models without alpha
["hsl", "hwb", "lab", "lch", "oklab", "oklch"].forEach((model) => {
  test(`stringifyColor ${model} without alpha`, () => {
    // @ts-ignore
    assert.is(
      stringifyColor({
        model: model as ColorData["model"],
        value: [10, 20, 30],
      }),
      `${model}(10 20 30)`
    );
  });
});

// color models with alpha
["hsl", "hwb", "lab", "lch", "oklab", "oklch"].forEach((model) => {
  test(`stringifyColor ${model} with alpha`, () => {
    // @ts-ignore
    assert.is(
      stringifyColor({
        model: model as ColorData["model"],
        value: [10, 20, 30],
        alpha: 0.25,
      }),
      `${model}(10 20 30 / 0.25)`
    );
  });
});
