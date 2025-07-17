import { isExpression, isStaticReference } from "@elllphnt/elementa-base";
import { createMarkup, markupTypes } from "~/libs/markups/markup.js";

export function generateDynamic(data: any): string {
  if (isStaticReference(data)) {
    return createMarkup(
      markupTypes.staticRef,
      JSON.stringify(data.__reference),
    );
  } else if (isExpression(data)) {
    return data.__expression;
  } else {
    return JSON.stringify(data);
  }
}
