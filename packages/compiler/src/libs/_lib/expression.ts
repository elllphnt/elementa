import { Expression, isExpression } from "@elllphnt/elll-element";
import { ComponentCompilerContext } from "../../types/component.js";

const twoSlashRegex = /^(\/\/\w+:\w+)/;

export function compileExpression(
  exp: Expression,
  context: ComponentCompilerContext
): string {
  if (twoSlashRegex.test(exp.__expression)) {
    const name = context.getEntityName(exp.__expression);
    return {
      generate: () => name,
    };
  } else {
    return {
      generate: () => {
        return `${exp.__expression}`;
      },
    };
  }
}

export function compileEvaluable(
  literal: any,
  context: ComponentCompilerContext
): string {
  let value = literal;

  if (typeof value === "object") {
    if (isExpression(literal)) {
      return compileExpression(literal, context);
    } else if (Array.isArray(value)) {
      const entries: CompilerResult[] = value.map((value) => {
        return compileEvaluable(value, context);
      });
      return {
        generate: (names) => {
          return [
            "[",
            entries.map((value) => {
              return value.generate(names);
            }),
            "]",
          ].join("");
        },
      };
    } else {
      const entries: [string, CompilerResult][] = Object.entries(value).map(
        ([key, value]) => {
          return [key, compileEvaluable(value, context)] as [
            string,
            CompilerResult
          ];
        }
      );
      return {
        generate: (names) => {
          return [
            "{",
            entries.map(([key, value]) => {
              return `"${key}": ${value.generate(names)}`;
            }),
            "}",
          ].join("");
        },
      };
    }
  } else if (typeof value === "undefined") {
    return {
      generate: () => {
        return "undefined";
      },
    };
  } else {
    return {
      generate: () => {
        return JSON.stringify(value);
      },
    };
  }
}
