import { SlotElementData } from "@elllphnt/elll-element";
import { TranspilerContext, TranspilerResult } from "../../types/transpiler.js";
import { compileStylesheet } from "../style/style.js";

export function transpileSlotElement(
  data: SlotElementData,
  _: TranspilerContext,
): TranspilerResult {
  const classes = compileStylesheet(data.stylesheet ?? {});
  const classesCode = classes.join(" ");

  return {
    generate: () => {
      return [
        `<>{`,
        `(()=>{`,
        `const { className, content } = props.__slotFills?.["${data._id}"] || {}`,
        `return <div className={className + " ${classesCode}"}>{content}</div>`,
        `})()`,
        `}</>`,
      ].join("\n");
    },
  };
}
