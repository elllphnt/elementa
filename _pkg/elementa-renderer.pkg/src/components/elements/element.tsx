import { entityTypes, switchEntityType } from "@elllphnt/elll-element";
import { memo } from "react";
import {
  ComponentElementRenderable,
  MediaElementRenderable,
  PageElementRenderable,
  PrimitiveElementRenderable,
} from "~/src/renderables/instances/_";
import { ContainerElementRenderable } from "../../renderables/instances/element/container";
import { ElementRenderable } from "../../renderables/instances/element/element";
import { SlotElementRenderable } from "../../renderables/instances/element/slot";
import { TextElementRenderable } from "../../renderables/instances/element/text";
import { VectorElementRenderable } from "../../renderables/instances/element/vector";
import { ElementErrorBoundary } from "./_/_error_boundary";
import ComponentElementComponent from "./components/component_element";
import { ContainerElementComponent } from "./container_element";
import { MediaElementComponent } from "./media/media_element";
import { PageElementComponent } from "./page_element";
import PrimitiveElementComponent from "./primitive_element";
import { SlotElementComponent } from "./slot_element";
import TextElementComponent from "./text/text_element";
import VectorElementComponent from "./vector/vector_element";

export const ElementComponent = memo(function ({
  element,
  onRef,
}: {
  element: ElementRenderable;
  onRef?: (element: HTMLElement | null, key?: string) => void;
}): JSX.Element {
  const content = switchEntityType(element.instance.entity.type, {
    [entityTypes.elements.component]: () => {
      const componentElement = element as ComponentElementRenderable;
      return (
        <ComponentElementComponent element={componentElement} onRef={onRef} />
      );
    },
    [entityTypes.elements.primitive]: () => {
      const primitiveElement = element as PrimitiveElementRenderable;
      return (
        <PrimitiveElementComponent element={primitiveElement} onRef={onRef} />
      );
    },
    [entityTypes.elements.container]: () => {
      const containerElement = element as ContainerElementRenderable;
      return (
        <ContainerElementComponent element={containerElement} onRef={onRef} />
      );
    },
    [entityTypes.elements.slot]: () => {
      const slotElement = element as SlotElementRenderable;
      return <SlotElementComponent element={slotElement} onRef={onRef} />;
    },
    [entityTypes.elements.text]: () => {
      const textElement = element as TextElementRenderable;
      return <TextElementComponent element={textElement} onRef={onRef} />;
    },
    [entityTypes.elements.media]: () => {
      const imageElement = element as MediaElementRenderable;
      return <MediaElementComponent element={imageElement} onRef={onRef} />;
    },
    [entityTypes.elements.vector]: () => {
      const vectorElement = element as VectorElementRenderable;
      return <VectorElementComponent element={vectorElement} onRef={onRef} />;
    },
    [entityTypes.elements.page]: () => {
      const pageElement = element as PageElementRenderable;
      return <PageElementComponent element={pageElement} onRef={onRef} />;
    },
  });

  return (
    <>
      <ElementErrorBoundary element={element}>{content}</ElementErrorBoundary>
    </>
  );
});

export default ElementComponent;
