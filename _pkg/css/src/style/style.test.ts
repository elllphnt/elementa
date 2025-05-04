import { RawStyleData, StyleData } from "@elllphnt/elementa-base";
import { test } from "uvu";
import * as assert from "uvu/assert";
import { styleToCss } from "./style";

test("raw property merges into CSS", () => {
  const data = { __raw: { "raw-prop": "rawValue" } };
  const [css, error] = styleToCss(data, { getFragment: () => undefined });
  assert.equal(error.length, 0);
  assert.equal(css["raw-prop"], "rawValue");
});

test("default undefined and unset", () => {
  const data: StyleData = { width: undefined, height: "unset" };
  const [css, error] = styleToCss(data, { getFragment: () => undefined });
  assert.equal(error.length, 0);
  assert.equal(css.width, undefined);
  assert.equal(css.height, undefined);
});

test("handles all RawStyleData properties", () => {
  // assign a dummy value for each RawStyleData key
  const data: Partial<RawStyleData> = {
    // position
    "position": "static",
    "top": { value: 1, unit: "px" },
    "left": { value: 1, unit: "px" },
    "right": { value: 1, unit: "px" },
    "bottom": { value: 1, unit: "px" },
    // size
    "width": { value: 1, unit: "px" },
    "height": { value: 1, unit: "px" },
    "min-width": { value: 1, unit: "px" },
    "min-height": { value: 1, unit: "px" },
    "max-width": { value: 1, unit: "px" },
    "max-height": { value: 1, unit: "px" },
    "aspect-ratio": [5, 8],
    // layout
    "display": "none",
    "align-items": "start",
    "justify-items": "end",
    "align-content": "center",
    "justify-content": "stretch",
    "overflow": "hidden",
    "z-index": 5,
    // flex
    "flex-direction": "row",
    "flex-wrap": "wrap",
    // grid
    "grid-template-columns": 2,
    "grid-template-rows": 2,
    "grid-column": 1,
    "grid-row": 1,
    "grid-auto-flow": "row dense",
    // gap
    "gap-x": { value: 2, unit: "px" },
    "gap-y": { value: 1, unit: "px" },
    // padding
    "padding-top": { value: 1, unit: "px" },
    "padding-right": { value: 1, unit: "px" },
    "padding-bottom": { value: 1, unit: "px" },
    "padding-left": { value: 1, unit: "px" },
    // background
    "background-color": { model: "rgb", value: [0, 0, 0], alpha: 1 },
    // border
    "border-top-style": "solid",
    "border-top-width": {
      value: 1,
      unit: "px",
    },
    "border-top-color": { model: "rgb", value: [0, 0, 0], alpha: 1 },
    "border-right-style": "dashed",
    "border-right-width": {
      value: 1,
      unit: "px",
    },
    "border-right-color": { model: "rgb", value: [0, 0, 0], alpha: 1 },
    "border-bottom-style": "dotted",
    "border-bottom-width": {
      value: 1,
      unit: "px",
    },
    "border-bottom-color": { model: "rgb", value: [0, 0, 0], alpha: 1 },
    "border-left-style": "double",
    "border-left-width": {
      value: 1,
      unit: "px",
    },
    "border-left-color": { model: "rgb", value: [0, 0, 0], alpha: 1 },
    // outline
    "outline-style": "solid",
    "outline-width": {
      value: 1,
      unit: "px",
    },
    "outline-color": { model: "rgb", value: [0, 0, 0], alpha: 1 },
    // border radius
    "border-top-left-radius": { value: 1, unit: "px" },
    "border-top-right-radius": { value: 1, unit: "px" },
    "border-bottom-right-radius": { value: 1, unit: "px" },
    "border-bottom-left-radius": { value: 1, unit: "px" },
    // text
    "font-family": "Arial",
    "font-weight-style": "bold",
    "font-size": { value: 1, unit: "px" },
    "text-transform": "uppercase",
    "text-decoration": "underline",
    "letter-spacing": {
      value: 1,
      unit: "em",
    },
    "text-overflow": "ellipsis",
    "white-space": "nowrap",
    "word-break": "break-all",
    "text-align": "center",
    "line-height": {
      value: 1,
      unit: "%",
    },
    // transform
    "translate-x": { value: 1, unit: "%" },
    "translate-y": { value: 1, unit: "%" },
    "translate-z": { value: 1, unit: "px" },
    "rotate-x": { value: 1, unit: "deg" },
    "rotate-y": { value: 1, unit: "deg" },
    "rotate-z": { value: 1, unit: "deg" },
    "scale-x": 1,
    "scale-y": 1,
    "scale-z": 1,
    "skew-x": { value: 1, unit: "deg" },
    "skew-y": { value: 1, unit: "deg" },
    // style
    "color": { model: "rgb", value: [0, 0, 0], alpha: 1 },
    "opacity": 0.5,
    "visibility": "hidden",
    "cursor": "pointer",
    // filter & animation
    "transition-property": "opacity",
    "transition-duration": {
      value: 1,
      unit: "s",
    },
    "transition-timing-function": "ease-in",
    "transition-delay": {
      value: 0.5,
      unit: "s",
    },
  };

  const [css, errors] = styleToCss(data as RawStyleData, {
    getFragment: () => undefined,
  });

  assert.equal(errors.length, 0);
  assert.equal(css["position"], "static");
  assert.equal(css["top"], "1px");
  assert.equal(css["left"], "1px");
  assert.equal(css["right"], "1px");
  assert.equal(css["bottom"], "1px");
  assert.equal(css["width"], "1px");
  assert.equal(css["height"], "1px");
  assert.equal(css["min-width"], "1px");
  assert.equal(css["min-height"], "1px");
  assert.equal(css["max-width"], "1px");
  assert.equal(css["max-height"], "1px");
  assert.equal(css["aspect-ratio"], "5 / 8");
  assert.equal(css["display"], "none");
  assert.equal(css["align-items"], "start");
  assert.equal(css["justify-items"], "end");
  assert.equal(css["align-content"], "center");
  assert.equal(css["justify-content"], "stretch");
  assert.equal(css["overflow"], "hidden");
  assert.equal(css["z-index"], "5");
  assert.equal(css["flex-direction"], "row");
  assert.equal(css["flex-wrap"], "wrap");
  assert.equal(css["grid-template-columns"], "repeat(2, 1fr)");
  assert.equal(css["grid-template-rows"], "repeat(2, 1fr)");
  assert.equal(css["grid-column"], "1");
  assert.equal(css["grid-row"], "1");
  assert.equal(css["grid-auto-flow"], "row dense");
  assert.equal(css["column-gap"], "2px");
  assert.equal(css["row-gap"], "1px");
  assert.equal(css["padding-top"], "1px");
  assert.equal(css["padding-right"], "1px");
  assert.equal(css["padding-bottom"], "1px");
  assert.equal(css["padding-left"], "1px");
  assert.equal(css["border-top-style"], "solid");
  assert.equal(css["border-top-width"], "1px");
  assert.equal(css["border-top-color"], "rgb(0 0 0 / 1)");
  assert.equal(css["border-right-style"], "dashed");
  assert.equal(css["border-right-width"], "1px");
  assert.equal(css["border-right-color"], "rgb(0 0 0 / 1)");
  assert.equal(css["border-bottom-style"], "dotted");
  assert.equal(css["border-bottom-width"], "1px");
  assert.equal(css["border-bottom-color"], "rgb(0 0 0 / 1)");
  assert.equal(css["border-left-style"], "double");
  assert.equal(css["border-left-width"], "1px");
  assert.equal(css["border-left-color"], "rgb(0 0 0 / 1)");
  assert.equal(css["outline-style"], "solid");
  assert.equal(css["outline-width"], "1px");
  assert.equal(css["outline-color"], "rgb(0 0 0 / 1)");
  assert.equal(css["border-top-left-radius"], "1px");
  assert.equal(css["border-top-right-radius"], "1px");
  assert.equal(css["border-bottom-right-radius"], "1px");
  assert.equal(css["border-bottom-left-radius"], "1px");
  assert.equal(css["font-family"], "Arial");
  assert.equal(css["font-weight"], "bold");
  assert.equal(css["font-style"], "normal");
  assert.equal(css["font-size"], "1px");
  assert.equal(css["text-transform"], "uppercase");
  assert.equal(css["text-decoration"], "underline");
  assert.equal(css["letter-spacing"], "1em");
  assert.equal(css["text-overflow"], "ellipsis");
  assert.equal(css["white-space"], "nowrap");
  assert.equal(css["word-break"], "break-all");
  assert.equal(css["text-align"], "center");
  assert.equal(css["line-height"], "1%");
  assert.equal(css["color"], "rgb(0 0 0 / 1)");
  assert.equal(css["opacity"], "0.5");
  assert.equal(css["visibility"], "hidden");
  assert.equal(css["cursor"], "pointer");
  assert.equal(css["transition-property"], "opacity");
  assert.equal(css["transition-duration"], "1s");
  assert.equal(css["transition-timing-function"], "ease-in");
  assert.equal(css["transition-delay"], "0.5s");

  // elll custom properties
  assert.equal(css["--elll-background-color"], "rgb(0 0 0 / 1)");
  assert.equal(css["--elll-translate-x"], "1%");
  assert.equal(css["--elll-translate-y"], "1%");
  assert.equal(css["--elll-translate-z"], "1px");
  assert.equal(css["--elll-rotate-x"], "1deg");
  assert.equal(css["--elll-rotate-y"], "1deg");
  assert.equal(css["--elll-rotate-z"], "1deg");
  assert.equal(css["--elll-scale-x"], "1");
  assert.equal(css["--elll-scale-y"], "1");
  assert.equal(css["--elll-scale-z"], "1");
  assert.equal(css["--elll-skew-x"], "1deg");
  assert.equal(css["--elll-skew-y"], "1deg");
});

// Overflow

test("overflow hidden", () => {
  const data: StyleData = { overflow: "hidden" };
  const [css, errors] = styleToCss(data, { getFragment: () => undefined });
  assert.equal(errors.length, 0);
  assert.equal(css["overflow"], "hidden");
});
test("overflow visible", () => {
  const data: StyleData = { overflow: "visible" };
  const [css, errors] = styleToCss(data, { getFragment: () => undefined });
  assert.equal(errors.length, 0);
  assert.equal(css["overflow"], "visible");
});
test("overflow scroll-area", () => {
  const data: StyleData = { overflow: "scroll-area" };
  const [css, errors] = styleToCss(data, { getFragment: () => undefined });
  assert.equal(errors.length, 0);
  assert.equal(css["overflow-x"], "auto");
  assert.equal(css["overflow-y"], "auto");
});
test("overflow scroll-x", () => {
  const data: StyleData = { overflow: "scroll-x" };
  const [css, errors] = styleToCss(data, { getFragment: () => undefined });
  assert.equal(errors.length, 0);
  assert.equal(css["overflow-x"], "auto");
});
test("overflow scroll-y", () => {
  const data: StyleData = { overflow: "scroll-y" };
  const [css, errors] = styleToCss(data, { getFragment: () => undefined });
  assert.equal(errors.length, 0);
  assert.equal(css["overflow-y"], "auto");
});

// Flex Direction

test("flex-direction sets flags", () => {
  const [css] = styleToCss(
    { "flex-direction": "column" },
    { getFragment: () => undefined }
  );
  assert.equal(css["flex-direction"], "column");
});

test("grid-template-columns sets repeat()", () => {
  const data = { "grid-template-columns": 3 };
  const [css] = styleToCss(data, { getFragment: () => undefined });
  assert.equal(css["grid-template-columns"], "repeat(3, 1fr)");
});

test("gap-x positive", () => {
  const [css] = styleToCss(
    { "gap-x": { value: 5, unit: "px" } },
    { getFragment: () => undefined }
  );
  assert.equal(css["column-gap"], "5px");
});

test("gap-y positive", () => {
  const [css] = styleToCss(
    { "gap-y": { value: 3, unit: "em" } },
    { getFragment: () => undefined }
  );
  assert.equal(css["row-gap"], "3em");
});

test("font-weight-style splits weight and style", () => {
  const [css] = styleToCss(
    { "font-weight-style": "600italic" },
    { getFragment: () => undefined }
  );
  assert.equal(css["font-weight"], "600");
  assert.equal(css["font-style"], "italic");
});
