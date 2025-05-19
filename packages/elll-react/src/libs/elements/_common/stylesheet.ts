import {
  styleConditionToClassName,
  StyleSheetData,
} from "@elllphnt/elementa-base";
import { TranspilerContext } from "build/index.js";
import { TranspilerResult } from "~/types/transpiler.js";

export function transpileStyleSheet(
  data: StyleSheetData,
  context: TranspilerContext
): TranspilerResult {
  const cx = context.useDependency({ url: "clsx" });
  const stylesheet = context.useStyleSheet(data);
  const conditions = data.conditions
    ? Object.entries(data.conditions).map(
        ([id, expression]) =>
          [styleConditionToClassName(id), expression] as [string, string]
      )
    : [];

  return {
    generate: (env) => {
      if (conditions.length) {
        const cxName = env.getName(cx.key);
        return `${cxName}("${env.getClassName(stylesheet.key)}", { ${conditions
          .map(([className, expression]) => `"${className}": ${expression}`)
          .join(", ")} })`;
      } else {
        return `"${env.getClassName(stylesheet.key)}"`;
      }
    },
  };
}
