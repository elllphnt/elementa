import { ContainerElementData } from "@elllphnt/elll-element";
import { CompilerResult } from "../../types/compiler.js";
import { ComponentCompilerContext } from "../../types/component.js";
import { compileExpression } from "../_lib/expression.js";
import { compileBaseElement } from "./_/base.js";
import { compileElement } from "./element.js";

export function compileContainerElement(
  data: ContainerElementData,
  context: ComponentCompilerContext,
  meta?: ElementCompilerMeta
): CompilerResult {
  let content: CompilerResult;

  if (data.contentExpression) {
    const exp = compileExpression(data.contentExpression, context);
    content = {
      generate: (names) => {
        return `{${exp.generate(names)}}`;
      },
    };
  } else {
    const children =
      data.children?.map((child) => compileElement(child, context, {})) ?? [];
    content = {
      generate: (names) => {
        return children?.map((child) => child.generate(names)).join("\n") || "";
      },
    };
  }

  return compileBaseElement({
    data,
    context,
    meta,
    content: {
      generate: (names) => {
        return content.generate(names);
      },
    },
  });
}
