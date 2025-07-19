import type { ElementData } from "@elllphnt/elementa-base";
import type { GeneratorContext } from "~/generators/component/types.js";
import { applyCondition } from "./_common/condition.js";
import { applyLink } from "./_common/link.js";
import { applyRepeat } from "./_common/repeat.js";
import { generatorComponentElement } from "./component.js";
import { generatorContainerElement } from "./container.js";
import { generatorExpressionElement } from "./expression.js";
import { generatorFragmentElement } from "./fragment.js";
import { generatorMediaElement } from "./media.js";
import { generatorPrimitiveElement } from "./primitive.js";
import { generatorSlotElement } from "./slot.js";
import { generatorTextElement } from "./text.js";
import { generatorVectorElement } from "./vector.js";

export function generateElementVariant({
  data,
  context,
}: {
  data: ElementData;
  context: GeneratorContext;
}): string {
  switch (data.type) {
    case "container":
      return generatorContainerElement(data, context);
    case "component":
      return generatorComponentElement(data, context);
    case "slot":
      return generatorSlotElement({ data, context });
    case "primitive":
      return generatorPrimitiveElement(data, context);
    case "text":
      return generatorTextElement({ data, context });
    case "media":
      return generatorMediaElement({ data, context });
    case "vector":
      return generatorVectorElement({ data, context });
    case "fragment":
      return generatorFragmentElement(data);
    case "expression":
      return generatorExpressionElement(data);
    default:
      throw new Error(`Unknown element type: ${(data as any).type}`);
  }
}

export function generateElement({
  data,
  context,
}: {
  data: ElementData;
  context: GeneratorContext;
}): string {
  let element = generateElementVariant({ data, context });

  if (data.link) {
    element = applyLink({
      link: data.link,
      content: element,
      context,
    });
  }
  if (data.repeat) {
    element = applyRepeat({
      repeat: data.repeat,
      content: element,
    });
  }
  if (data.condition) {
    element = applyCondition({
      condition: data.condition,
      content: element,
    });
  }

  return element;
}
