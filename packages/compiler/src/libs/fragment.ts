import { FragmentData, OverflowValue } from "@elllphnt/elll-element";
import { ComponentCompilerContext } from "../types/component.js";
import { compileElement } from "./elements/element.js";
import { compilePageElement } from "./elements/page.js";

export function compileFragment(
  data: FragmentData,
  context: ComponentCompilerContext,
  options?: {
    viewport?: {
      overflow: OverflowValue;
    };
  }
): string {
  let content: string;

  if (options?.viewport) {
    content = compilePageElement(
      {
        ...data.page,
        type: "page",
        content: data.content,
        viewportOverflow: options.viewport.overflow,
      },
      context
    );
  } else {
    content = [
      `<>`,
      ...(data.content?.map((child) => compileElement(child, context, {})) ??
        []),
      `</>`,
    ].join("\n");
  }

  return `($={})=>(${content})`;
}
