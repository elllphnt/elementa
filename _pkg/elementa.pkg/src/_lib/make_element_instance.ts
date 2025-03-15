import { entityTypes, switchEntityType } from "@elllphnt/elll-element";
import {
  ComponentElement,
  ContainerElement,
  Element,
  MediaElement,
  PageElement,
  PrimitiveElement,
  SlotElement,
  TextElement,
  VectorElement,
} from "@repo/elementa-models";
import {
  ComponentElementInstance,
  ContainerElementInstance,
  ElementInstance,
  Instance,
  MediaElementInstance,
  PageElementInstance,
  PrimitiveElementInstance,
  SlotElementInstance,
  TextElementInstance,
  VectorElementInstance,
} from "~/src/instances/_";
import { FragmentEnvironment } from "../instances/fragment/environment";

export function makeElementInstance({
  element,
  environment,
  parent,
}: {
  element: Element;
  environment: FragmentEnvironment;
  parent: Instance | null;
}): ElementInstance {
  return switchEntityType(element.type, {
    [entityTypes.elements.component]: () =>
      new ComponentElementInstance({
        element: element as ComponentElement,
        environment,
        parent,
      }) as ElementInstance,
    [entityTypes.elements.primitive]: () =>
      new PrimitiveElementInstance({
        element: element as PrimitiveElement,
        environment,
        parent,
      }) as ElementInstance,
    [entityTypes.elements.container]: () =>
      new ContainerElementInstance({
        element: element as ContainerElement,
        environment,
        parent,
      }),
    [entityTypes.elements.slot]: () =>
      new SlotElementInstance({
        element: element as SlotElement,
        environment,
        parent,
      }),
    [entityTypes.elements.page]: () =>
      new PageElementInstance({
        element: element as PageElement,
        environment,
        parent,
      }),
    [entityTypes.elements.media]: () =>
      new MediaElementInstance({
        element: element as MediaElement,
        environment,
        parent,
      }),
    [entityTypes.elements.text]: () =>
      new TextElementInstance({
        element: element as TextElement,
        environment,
        parent,
      }),
    [entityTypes.elements.vector]: () =>
      new VectorElementInstance({
        element: element as VectorElement,
        environment,
        parent,
      }),
  });
}
