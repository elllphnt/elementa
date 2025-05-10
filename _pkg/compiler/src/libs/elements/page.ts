import {
  ElementData,
  OverflowValue,
  PageElementData,
} from "@elllphnt/elll-element";
import { compileBaseElement } from "./_/base.js";
import { compileElement } from "./element.js";
import { ComponentCompilerContext } from "../../types/component.js";
import { CompilerResult } from "../../types/compiler.js";

export function compilePageElement(
  data: PageElementData & {
    content?: ElementData[];
    viewportOverflow?: OverflowValue;
  },
  context: ComponentCompilerContext
): string {
  const content =
    data.content?.map((child) => compileElement(child, context, {})) ?? [];

  const style: React.CSSProperties = {
    minHeight: "calc(100 * var(--vh-unit))",
    minWidth: "calc(100 * var(--vw-unit))",
    background: "none",
  };

  if (data.viewportOverflow === "scroll-x") {
    style.height = "calc(100 * var(--vh-unit))";
  } else if (data.viewportOverflow === "scroll-y") {
    style.width = "calc(100 * var(--vw-unit))";
  }

  return compileBaseElement({
    data,
    context,
    meta: {
      props: {
        style: style,
        className: "elll-page",
      },
    },
    content: {
      generate: (names) => {
        return content.map((c) => c.generate(names)).join("\n");
      },
    },
  });
}
