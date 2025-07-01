import { RecordState } from "@elllphnt/elementa-kernel";
import { ElementEnvironment } from "./_environment.js";
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
  switch (type) {
    case "container":
      return new ContainerElement({ state, environment, initialized });
    case "text":
      return new TextElement({ state, environment, initialized });
    case "vector":
      return new VectorElement({ state, environment, initialized });
    case "slot":
      return new SlotElement({ state, environment, initialized });
    case "media":
      return new MediaElement({ state, environment, initialized });
    case "component":
      return new ComponentElement({ state, environment, initialized });
    case "primitive":
      return new PrimitiveElement({ state, environment, initialized });
    case "fragment":
      return new FragmentElement({ state, environment, initialized });
    case "expression":
      return new ExpressionElement({ state, environment, initialized });
    default:
      throw new Error(`Unknown element type: ${type}`);
  }
}
