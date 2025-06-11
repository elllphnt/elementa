import { RenderingEnvironment } from "@elllphnt/elementa-core";
import * as y from "yjs";
import { CrdtComponentElement } from "./component.js";
import { CrdtContainerElement } from "./container.js";
import { CrdtExpressionElement } from "./expression.js";
import { CrdtFragmentElement } from "./fragment.js";
import { CrdtMediaElement } from "./media.js";
import { CrdtPrimitiveElement } from "./primitive/primitive.js";
import { CrdtSlotElement } from "./slot.js";
import { CrdtTextElement } from "./text.js";
import { CrdtVectorElement } from "./vector.js";

export type CrdtElement =
  | CrdtComponentElement
  | CrdtContainerElement
  | CrdtMediaElement
  | CrdtPrimitiveElement
  | CrdtSlotElement
  | CrdtTextElement
  | CrdtFragmentElement
  | CrdtVectorElement
  | CrdtExpressionElement;

export function CrdtcreateElement({
  crdt,
  environment,
  initialized,
}: {
  crdt: y.Map<any>;
  environment: RenderingEnvironment;
  initialized?: boolean;
}): CrdtElement {
  const type = crdt.get("type");
  switch (type) {
    case "container":
      return new CrdtContainerElement({ crdt, environment, initialized });
    case "text":
      return new CrdtTextElement({ crdt, environment, initialized });
    case "vector":
      return new CrdtVectorElement({ crdt, environment, initialized });
    case "slot":
      return new CrdtSlotElement({ crdt, environment, initialized });
    case "media":
      return new CrdtMediaElement({ crdt, environment, initialized });
    case "component":
      return new CrdtComponentElement({ crdt, environment, initialized });
    case "primitive":
      return new CrdtPrimitiveElement({ crdt, environment, initialized });
    case "fragment":
      return new CrdtFragmentElement({ crdt, environment, initialized });
    case "expression":
      return new CrdtExpressionElement({ crdt, environment, initialized });
    default:
      throw new Error(`Unknown element type: ${type}`);
  }
}
