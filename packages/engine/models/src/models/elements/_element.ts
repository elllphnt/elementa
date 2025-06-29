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
}: {
  state: RecordState<any>;
  environment: ElementEnvironment;
}): Element {
  const type = state.entry("type");
  switch (type) {
    case "container":
      return new ContainerElement({ state, environment });
    case "text":
      return new TextElement({ state, environment });
    case "vector":
      return new VectorElement({ state, environment });
    case "slot":
      return new SlotElement({ state, environment });
    case "media":
      return new MediaElement({ state, environment });
    case "component":
      return new ComponentElement({ state, environment });
    case "primitive":
      return new PrimitiveElement({ state, environment });
    case "fragment":
      return new FragmentElement({ state, environment });
    case "expression":
      return new ExpressionElement({ state, environment });
    default:
      throw new Error(`Unknown element type: ${type}`);
  }
}
