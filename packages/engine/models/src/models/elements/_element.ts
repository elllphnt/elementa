import type { RecordState } from "@elllphnt/elementa-kernel";
import type { ElementEnvironment } from "./_environment.js";
import { ComponentElement } from "./component/component.js";
import { ContainerElement } from "./container.js";
import { ExpressionElement } from "./expression.js";
import { FragmentElement } from "./fragment.js";
import { MediaElement } from "./media.js";
import { PrimitiveElement } from "./primitive/primitive.js";
import { SlotElement } from "./slot.js";
import { TextElement } from "./text.js";
import { VectorElement } from "./vector.js";

export type Element =
  | ComponentElement
  | ContainerElement
  | MediaElement
  | PrimitiveElement
  | SlotElement
  | TextElement
  | FragmentElement
  | VectorElement
  | ExpressionElement;

export function createElement({
  state,
  environment,
  initialized,
}: {
  state: RecordState<any>;
  environment: ElementEnvironment;
  initialized?: boolean;
}): Element {
  const type = state.entry("type");
  let element: Element;

  switch (type) {
    case "container":
      element = new ContainerElement({ state, environment, initialized });
      break;
    case "text":
      element = new TextElement({ state, environment, initialized });
      break;
    case "vector":
      element = new VectorElement({ state, environment, initialized });
      break;
    case "slot":
      element = new SlotElement({ state, environment, initialized });
      break;
    case "media":
      element = new MediaElement({ state, environment, initialized });
      break;
    case "component":
      element = new ComponentElement({ state, environment, initialized });
      break;
    case "primitive":
      element = new PrimitiveElement({ state, environment, initialized });
      break;
    case "fragment":
      element = new FragmentElement({ state, environment, initialized });
      break;
    case "expression":
      element = new ExpressionElement({ state, environment, initialized });
      break;
    default:
      throw new Error(`Unknown element type: ${type}`);
  }
  return element;
}
