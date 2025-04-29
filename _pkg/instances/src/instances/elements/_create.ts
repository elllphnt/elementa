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

import {
  ComponentElementInstance,
  ContainerElementInstance,
  ElementInstance,
  Instance,
  MediaElementInstance,
  PrimitiveElementInstance,
  SlotElementInstance,
  TextElementInstance,
  VectorElementInstance,
} from "~/src/instances/_";

import { FragmentEnvironment } from "../fragment/environment/environment";

export function makeElementInstance({
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
      throw new Error(`Unknown element type: ${(element as any).type}`);
  }
}
