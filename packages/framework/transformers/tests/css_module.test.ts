import { baseSelector } from "@elllphnt/elementa-base";
import { describe, expect, test } from "vitest";
import { getStyleClassFromCssModule } from "../src/parsers/component/css/css.js";
import { parseCssModule } from "../src/parsers/component/css/module.js";

function styleClassFor(css: string, id: string) {
  return getStyleClassFromCssModule({
    id,
    module: parseCssModule(css),
    getModifierDefinition: () => undefined,
  });
}

describe("CSS module → style class", () => {
  test("an @media block around an ID stays conditional", () => {
    const { styles = {} } = styleClassFor(
      `
      #root { display: flex; background-color: #f8f8f8; }
      @media (prefers-color-scheme: dark) {
        #root { background-color: #1b1b1b; }
      }
      `,
      "root"
    );

    // Base keeps its own declarations and is not overwritten by the media rule.
    expect(styles[baseSelector]?.__raw).toEqual({
      display: "flex",
      "background-color": "#f8f8f8",
    });

    // The dark declarations live under a separate, media-qualified selector.
    const conditional = Object.keys(styles).filter((s) => s !== baseSelector);
    expect(conditional).toHaveLength(1);
    expect(decodeURIComponent(conditional[0])).toContain("prefers-color-scheme: dark");
    expect(styles[conditional[0]]?.__raw).toEqual({
      "background-color": "#1b1b1b",
    });
  });

  test("an ID nested in another ID inside @media keeps the media condition", () => {
    const { styles = {} } = styleClassFor(
      `
      #root { #greeting { opacity: 0.7; } }
      @media (prefers-color-scheme: dark) {
        #root { #greeting { color: #858585; } }
      }
      `,
      "greeting"
    );

    expect(styles[baseSelector]?.__raw).toEqual({ opacity: "0.7" });
    const conditional = Object.keys(styles).find((s) => s !== baseSelector);
    expect(decodeURIComponent(conditional!)).toContain("prefers-color-scheme: dark");
    expect(styles[conditional!]?.__raw).toEqual({ color: "#858585" });
  });

  test("repeated rules for the same ID merge in cascade order", () => {
    const { styles = {} } = styleClassFor(
      `
      #root { color: red; padding: 4px; }
      #root { color: blue; }
      `,
      "root"
    );

    expect(styles[baseSelector]?.__raw).toEqual({
      color: "blue",
      padding: "4px",
    });
  });
});
