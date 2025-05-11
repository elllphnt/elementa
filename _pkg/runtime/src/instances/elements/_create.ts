import {
  ComponentElement,
  ContainerElement,
  Element,
  MediaElement,
  PrimitiveElement,
  SlotElement,
  TextElement,
  VectorElement,
} from "@elllphnt/elementa-models";

import { FragmentEnvironment } from "../fragment/environment/environment.js";
import { Instance } from "../instance.js";
import { ComponentElementInstance } from "./component/component.js";
import { ContainerElementInstance } from "./container.js";
import { ElementInstance } from "./element.js";
import { MediaElementInstance } from "./media.js";
import { PrimitiveElementInstance } from "./primitive.js";
import { SlotElementInstance } from "./slot.js";
import { TextElementInstance } from "./text.js";
import { VectorElementInstance } from "./vector.js";

export function createElementInstance({
  element,
  environment,
  parent,
}: {
  element: Element;
  environment: FragmentEnvironment;
  parent?: Instance;
}): ElementInstance {
  switch (element.type) {
    case "container":
      return new ContainerElementInstance({
        element: element as ContainerElement,
        environment,
        parent,
      });

    case "component":
      return new ComponentElementInstance({
        element: element as ComponentElement,
        environment,
        parent,
      });

    case "media":
      return new MediaElementInstance({
        element: element as MediaElement,
        environment,
        parent,
      });

    case "primitive":
      return new PrimitiveElementInstance({
        element: element as PrimitiveElement,
        environment,
        parent,
      });

    case "slot":
      return new SlotElementInstance({
        element: element as SlotElement,
        environment,
        parent,
      });

    case "text":
      return new TextElementInstance({
        element: element as TextElement,
        environment,
        parent,
      });

    case "vector":
      return new VectorElementInstance({
        element: element as VectorElement,
        environment,
        parent,
      });

    default:
      throw new Error(`Unknown element type: ${element.type}`);
  }
}
