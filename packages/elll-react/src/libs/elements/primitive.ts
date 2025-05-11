import { isReference, PrimitiveElementData } from "@elllphnt/elll-element";
import { TranspilerContext, TranspilerResult } from "../../types/transpiler.js";
import { Environment } from "../_env.js";
import { transpileEvaluable } from "../evaluable.js";
import { compileStylesheet } from "../style/style.js";
import { transpileElement } from "./element.js";

export function compileCodeComponentElement(
  data: PrimitiveElementData,
  context: TranspilerContext,
): TranspilerResult {
  if (!data.moduleUrl) {
    console.warn(`No component URL provided for code component`);
    return {
      generate: () => {
        return `<>{/* No component URL provided for code component */}</>`;
      },
    };
  }

  const classes = compileStylesheet(data.stylesheet ?? {});
  const classesCode = classes.join(" ");
  const children = data.content?.map((child) =>
    transpileElement(child, context),
  );
  const component = context.useDependency({
    url: data.moduleUrl,
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
      const propsCode = [
        `className="${classesCode}"`,
        ...propCodes.map((p) => p(env)),
      ].join(" ");

      if (children?.length) {
        const childrenCodes = children.map((c) => c.generate(env));
        return [
          `<${componentName} ${propsCode}>`,
          ...childrenCodes,
          `</${componentName}>`,
        ].join("\n");
      } else {
        return `<${componentName} ${propsCode} />`;
      }
    },
  };
}
