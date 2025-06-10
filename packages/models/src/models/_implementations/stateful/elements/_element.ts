import { ElementData } from "@elllphnt/elementa-base";
import { ElementEnvironment } from "~/models/component/_.js";
import { ComponentElementModel } from "./component.js";
import { ContainerElementModel } from "./container.js";
import { ExpressionElementModel } from "./expression.js";
import { FragmentElementModel } from "./fragment.js";
import { MediaElementModel } from "./media.js";
import { PrimitiveElementModel } from "./primitive/primitive.js";
import { SlotElementModel } from "./slot.js";
import { TextElementModel } from "./text.js";
import { VectorElementModel } from "./vector.js";

export type ElementModel =
  | ComponentElementModel
  | ContainerElementModel
  | MediaElementModel
  | PrimitiveElementModel
  | SlotElementModel
  | TextElementModel
  | FragmentElementModel
  | VectorElementModel
  | ExpressionElementModel;

export function createElementModel({
  init,
  environment,
}: {
  init: ElementData;
  environment: ElementEnvironment;
}): ElementModel {
  switch (init.type) {
    case "container":
      return new ContainerElementModel({ init, environment });
    case "text":
      return new TextElementModel({ init, environment });
    case "vector":
      return new VectorElementModel({ init, environment });
    case "slot":
      return new SlotElementModel({ init, environment });
    case "media":
      return new MediaElementModel({ init, environment });
    case "component":
      return new ComponentElementModel({ init, environment });
    case "primitive":
      return new PrimitiveElementModel({ init, environment });
    case "fragment":
      return new FragmentElementModel({ init, environment });
    case "expression":
      return new ExpressionElementModel({ init, environment });
    default:
      throw new Error(`Unknown element type: ${(init as any).type}`);
  }
}
