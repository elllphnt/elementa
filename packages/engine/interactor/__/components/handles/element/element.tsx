import { entityTypes, switchEntityType } from "@elllphnt/elementa-base";
import { memo } from "react";
import type {
  ComponentElementHandle,
  ContainerElementHandle,
  ElementHandle,
  MediaElementHandle,
  PrimitiveElementHandle,
  SlotElementHandle,
  TextElementHandle,
  VectorElementHandle,
} from "~/handles/_";
import { ComponentElementHandleComponent } from "./component_element.js";
import { ContainerElementHandleComponent } from "./container_element.js";
import { MediaElementHandleComponent } from "./content_element.js";
import { PrimitiveElementHandleComponent } from "./primitive_element.js";
import { SlotElementHandleComponent } from "./slot_element.js";
import { TextElementHandleComponent } from "./text_element.js";
import { VectorElementHandleComponent } from "./vector_element.js";

export const ElementHandleComponent = memo(function ElementHandleComponent({
  element,
}: {
  element: ElementHandle;
}) {
  // const hidden = useObservable(
  //   element.instance.resolvedHidden$,
  //   element.instance.resolvedHidden,
  // );

  // if (hidden) return <></>;

  const handle = switchEntityType(element.renderable.instance.entity.type, {
    [entityTypes.elements.component]: () => {
      const componentElement = element as ComponentElementHandle;
      return <ComponentElementHandleComponent element={componentElement} />;
    },
    [entityTypes.elements.primitive]: () => {
      const componentElement = element as PrimitiveElementHandle;
      return <PrimitiveElementHandleComponent element={componentElement} />;
    },
    [entityTypes.elements.container]: () => {
      const containerElement = element as ContainerElementHandle;
      return <ContainerElementHandleComponent element={containerElement} />;
    },
    [entityTypes.elements.slot]: () => {
      const slotElement = element as SlotElementHandle;
      return <SlotElementHandleComponent element={slotElement} />;
    },
    [entityTypes.elements.media]: () => {
      const mediaElement = element as MediaElementHandle;
      return <MediaElementHandleComponent element={mediaElement} />;
    },
    [entityTypes.elements.text]: () => {
      const textElement = element as TextElementHandle;
      return <TextElementHandleComponent element={textElement} />;
    },
    [entityTypes.elements.vector]: () => {
      const vectorElement = element as VectorElementHandle;
      return <VectorElementHandleComponent element={vectorElement} />;
    },
  });

  return <>{handle}</>;
});
