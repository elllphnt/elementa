import type { Element } from "@elllphnt/elementa-models";

import type { Instance } from "../instance.js";
import type { ElementRuntimeEnvironment } from "./_environment/environment.js";
import { ComponentElementInstance } from "./component/component.js";
import { ContainerElementInstance } from "./container.js";
import { ExpressionElementInstance } from "./expression.js";
import { FragmentElementInstance } from "./fragment/fragment.js";
import { MediaElementInstance } from "./media.js";
import { PrimitiveElementInstance } from "./primitive.js";
import { SlotElementInstance } from "./slot.js";
import { TextElementInstance } from "./text.js";
import { VectorElementInstance } from "./vector.js";

export type ElementInstance =
  | ContainerElementInstance
  | ComponentElementInstance
  | MediaElementInstance
  | PrimitiveElementInstance
  | SlotElementInstance
  | TextElementInstance
  | FragmentElementInstance
  | ExpressionElementInstance
  | VectorElementInstance;

export function createElementInstance({
  element,
  environment,
  parent,
}: {
  element: Element;
  environment: ElementRuntimeEnvironment;
  parent?: Instance;
}): ElementInstance {
  switch (element.type) {
    case "container":
      return new ContainerElementInstance({
        element: element,
        environment,
        parent,
      });

    case "component":
      return new ComponentElementInstance({
        element: element,
        environment,
        parent,
      });

    case "media":
      return new MediaElementInstance({
        element: element,
        environment,
        parent,
      });

    case "primitive":
      return new PrimitiveElementInstance({
        element: element,
        environment,
        parent,
      });

    case "slot":
      return new SlotElementInstance({
        element: element,
        environment,
        parent,
      });

    case "text":
      return new TextElementInstance({
        element: element,
        environment,
        parent,
      });

    case "vector":
      return new VectorElementInstance({
        element: element,
        environment,
        parent,
      });

    case "expression":
      return new ExpressionElementInstance({
        element: element,
        environment,
        parent,
      });

    case "fragment":
      return new FragmentElementInstance({
        element: element,
        environment,
        parent,
      });

    default:
      throw new Error(`Unknown element type: ${(element as any).type}`);
  }
}
