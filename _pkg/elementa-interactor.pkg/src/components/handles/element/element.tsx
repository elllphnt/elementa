import { entityTypes, switchEntityType } from "@elllphnt/elll-element";
import { memo } from "react";
import {
  ArrayElementHandle,
  ComponentElementHandle,
  ContainerElementHandle,
  ElementHandle,
  MediaElementHandle,
  PageElementHandle,
  SlotElementHandle,
  TextElementHandle,
  VectorElementHandle,
} from "~/src/handles/_";
import { HandleConnectionSet } from "../connection_set";
import { ArrayElementHandleComponent } from "./array_element";
import { ComponentElementHandleComponent } from "./component/component_element";
import { ContainerElementHandleComponent } from "./container_element";
import { MediaElementHandleComponent } from "./content_element";
import { PageElementHandleComponent } from "./page_element";
import { SlotElementHandleComponent } from "./slot_element";
import { TextElementHandleComponent } from "./text_element";
import { VectorElementHandleComponent } from "./vector_element";

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
    [entityTypes.elements.array]: () => {
      const arrayElement = element as ArrayElementHandle;
      return <ArrayElementHandleComponent element={arrayElement} />;
    },
    [entityTypes.elements.page]: () => {
      const pageElement = element as PageElementHandle;
      return <PageElementHandleComponent element={pageElement} />;
    },
  });

  return (
    <>
      {handle}
      <HandleConnectionSet handle={element} />
    </>
  );
});
