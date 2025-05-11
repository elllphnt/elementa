import { ComponentElementData } from "@elllphnt/elll-element";
import { CompilerResult } from "../../types/compiler.js";
import { ComponentCompilerContext } from "../../types/component.js";
import { compileEvaluable } from "../_lib/expression.js";
import { getName } from "../_lib/names.js";
import { compileBaseElement } from "./_/base.js";

export function compileComponentElement(
  data: ComponentElementData,
  context: ComponentCompilerContext,
  meta?: ElementCompilerMeta
): CompilerResult {
  const componentDependency = data.componentUrl
    ? context.useComponent(data.componentUrl)
    : undefined;
  const props = Object.entries(data.props || {}).map(([key, value]) => {
    return [key, compileEvaluable(value, context)] as [string, CompilerResult];
  });

  return compileBaseElement({
    data,
    context,
    meta,
    content: {
      generate: (names) => {
        if (!componentDependency) {
          return "";
        }
        const name = getName(names, componentDependency.key);
        return [
          `<${name} `,
          props
            .map(([key, value]) => {
              return `${key}={${value.generate(names)}}`;
            })
            .join(" "),
          `/>`,
        ].join("");
      },
    },
  });
}
