import {
  ComponentElementData,
  isReference,
  SlotFillData,
} from "@elllphnt/elll-element";
import { TranspilerContext, TranspilerResult } from "../../types/transpiler.js";
import { Environment } from "../_env.js";
import { transpileEvaluable } from "../evaluable.js";
import { compileStylesheet } from "../style/style.js";
import { transpileElement } from "./element.js";

function transpileSlotFill(
  data: SlotFillData,
  context: TranspilerContext,
): TranspilerResult {
  const classes = compileStylesheet(data.stylesheet ?? {});
  const classesCode = classes.join(" ");
  let content =
    data.content?.map((data) => transpileElement(data, context)) ?? [];

  return {
    generate: (env) => {
      let contentCode: string;

      if (!content.length) {
        contentCode = "<></>";
      } else if (content.length === 1) {
        contentCode = content[0].generate(env);
      } else {
        const codes = content.map((c) => c.generate(env));
        contentCode = [`<>`, ...codes, `</>`].join("\n");
      }

      return `{className: "${classesCode}", content: ${contentCode}}`;
    },
  };
}

export function transpileComponentElement(
  data: ComponentElementData,
  context: TranspilerContext,
): TranspilerResult {
  if (!data.componentUrl) {
    console.warn(`No URL provided for component`);
    return {
      generate: () => {
        return `<>{/* No URL provided for component */}</>`;
      },
    };
  }

  const classes = compileStylesheet(data.stylesheet ?? {});
  const classesCode = classes.join(" ");
  const slotfills = Object.fromEntries(
    Object.entries(data.slotFills ?? {}).map(([key, value]) => {
      return [key, transpileSlotFill(value, context)];
    }),
  );
  const component = context.useDependency({
    url: data.componentUrl,
    name: {
      capitalize: true,
    },
  });
  const propCodes = Object.entries(data.props ?? {}).map(([key, value]) => {
    if (isReference(value)) {
      const ref = context.useReference(value);
      return (env: Environment) => {
        const value = env.getResolvedValue(ref.key);
        return `${key}={${transpileEvaluable(value)}}`;
      };
    } else {
      const valueCode = transpileEvaluable(value);
      return () => `${key}={${valueCode}}`;
    }
  });

  return {
    generate: (env) => {
      const componentName = env.getName(component.key);
      const slotFillCodes = Object.entries(slotfills).map(([key, value]) => {
        return `${key}: ${value.generate(env)}`;
      });
      const propsCode = [
        ...propCodes.map((p) => p(env)),
        `__slotFills={{${slotFillCodes.join(", ")}}}`,
      ].join(" ");

      return [
        `<div className="${classesCode}">`,
        `<${componentName} ${propsCode} />`,
        `</div>`,
      ].join("\n");
    },
  };
}
