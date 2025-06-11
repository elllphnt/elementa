import { ElementData } from "@elllphnt/elementa-base";
import { RenderingEnvironment } from "@elllphnt/elementa-core";
import { StatefulComponentElement } from "./component.js";
import { StatefulContainerElement } from "./container.js";
import { StatefulExpressionElement } from "./expression.js";
import { StatefulFragmentElement } from "./fragment.js";
import { StatefulMediaElement } from "./media.js";
import { StatefulPrimitiveElement } from "./primitive/primitive.js";
import { StatefulSlotElement } from "./slot.js";
import { StatefulTextElement } from "./text.js";
import { StatefulVectorElement } from "./vector.js";

export type StatefulElement =
  | StatefulComponentElement
  | StatefulContainerElement
  | StatefulMediaElement
  | StatefulPrimitiveElement
  | StatefulSlotElement
  | StatefulTextElement
  | StatefulFragmentElement
  | StatefulVectorElement
  | StatefulExpressionElement;

export function StatefulcreateElement({
  init,
  environment,
}: {
  init: ElementData;
  environment: RenderingEnvironment;
}): StatefulElement {
  switch (init.type) {
    case "container":
      return new StatefulContainerElement({ init, environment });
    case "text":
      return new StatefulTextElement({ init, environment });
    case "vector":
      return new StatefulVectorElement({ init, environment });
    case "slot":
      return new StatefulSlotElement({ init, environment });
    case "media":
      return new StatefulMediaElement({ init, environment });
    case "component":
      return new StatefulComponentElement({ init, environment });
    case "primitive":
      return new StatefulPrimitiveElement({ init, environment });
    case "fragment":
      return new StatefulFragmentElement({ init, environment });
    case "expression":
      return new StatefulExpressionElement({ init, environment });
    default:
      throw new Error(`Unknown element type: ${(init as any).type}`);
  }
}
