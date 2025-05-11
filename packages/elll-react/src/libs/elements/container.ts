import { ContainerElementData } from "@elllphnt/elll-element";
import { TranspilerContext, TranspilerResult } from "../../types/transpiler.js";
import { compileStylesheet } from "../style/style.js";
import { transpileElement } from "./element.js";

export function transpileContainerElement(
  data: ContainerElementData,
  context: TranspilerContext,
): TranspilerResult {
  const classes = compileStylesheet(data.stylesheet ?? {});
  const classesCode = classes.join(" ");
  const children = data.content?.map((content) =>
    transpileElement(content, context),
  );

  return {
    generate: (env) => {
      const propsCode = `className="${classesCode}"`;
      if (children?.length) {
        const childrenCode = children.map((c) => c.generate(env));
        return [`<div ${propsCode} >`, ...childrenCode, `</div>`].join("\n");
      } else {
        return `<div ${propsCode} />`;
      }
    },
  };
}
