import { baseSelector } from "@elllphnt/elementa-base";
import { describe, expect, test } from "vitest";
import { parseComponentModule } from "~/parsers/component/module.js";

/** Depth-first search for the first node matching `predicate`. */
function find(node: unknown, predicate: (n: any) => boolean): any {
  if (!node || typeof node !== "object") return undefined;
  if (predicate(node)) return node;
  for (const value of Object.values(node)) {
    const hit = find(value, predicate);
    if (hit) return hit;
  }
  return undefined;
}

describe("parseComponentModule", () => {
  test("passes JSX attributes to child components as props", () => {
    const data = parseComponentModule(`
      import Card from "./card.component.js";
      export default function Page() {
        return <div><Card id="hero" title="Hello" count={3} featured onClick={() => {}} /></div>;
      }
    `);

    const card = find(data.content, (n) => n.type === "component");
    expect(card.props).toEqual({ title: "Hello", count: 3, featured: true });
  });

  test("a styled <a> becomes a container that keeps its link and styles", () => {
    const data = parseComponentModule(`
      export const styles = \`#cta { padding: 12px; }\`;
      export default function Page() {
        return <div><a id="cta" href="/signup"><span>Start</span><span>→</span></a></div>;
      }
    `);

    const cta = find(data.content, (n) => n.link?.href === "/signup");
    expect(cta.type).toBe("container");
    expect(cta.content).toHaveLength(2);
    expect(cta.styleClass.styles[baseSelector].__raw).toEqual({
      padding: "12px",
    });
  });

  test("a bare <a> still attaches its link to its only child", () => {
    const data = parseComponentModule(`
      export default function Page() {
        return <nav><a href="/docs">Docs</a></nav>;
      }
    `);

    const docs = find(data.content, (n) => n.link?.href === "/docs");
    expect(docs.type).toBe("text");
  });

  test("components with an early return compile", () => {
    const data = parseComponentModule(`
      export default function Hero({ data }: { data?: { title: string } }) {
        if (!data) return <div id="empty" />;
        return <h1 id="title">{data.title}</h1>;
      }
    `);

    expect(data.content?.[0]).toMatchObject({ type: "expression" });
  });

  test("reads side-car stylesheet imports, letting inline styles override", () => {
    const data = parseComponentModule(
      `
      import "./page.component.css";
      export const styles = \`#root { color: white; }\`;
      export default function Page() {
        return <div id="root" />;
      }
    `,
      {
        readStyleImport: (specifier) =>
          specifier === "./page.component.css"
            ? "#root { color: black; padding: 8px; }"
            : undefined,
      }
    );

    expect(data.content?.[0].styleClass?.styles?.[baseSelector]).toEqual({
      __raw: { color: "white", padding: "8px" },
    });
  });
});
