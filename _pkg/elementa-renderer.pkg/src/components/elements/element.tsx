import { entityTypes, switchEntityType } from "@elllphnt/elll-element";
import { memo } from "react";
import {
  ComponentElementRenderable,
  MediaElementRenderable,
  PageElementRenderable,
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
import { SlotElementComponent } from "./slot_element";
import TextElementComponent from "./text/text_element";
import VectorElementComponent from "./vector/vector_element";

export const ElementComponent = memo(function ({
  element,
  data,
  partKey,
}: {
  element: ElementRenderable;
  data?: any;
  partKey?: string;
}): JSX.Element {
  const content = switchEntityType(element.instance.entity.type, {
    [entityTypes.elements.component]: () => {
      const componentElement = element as ComponentElementRenderable;
      return (
        <ComponentElementComponent
          partKey={partKey}
          element={componentElement}
        />
      );
    },
    [entityTypes.elements.container]: () => {
      const containerElement = element as ContainerElementRenderable;
      return (
        <ContainerElementComponent
          partKey={partKey}
          element={containerElement}
        />
      );
    },
    [entityTypes.elements.slot]: () => {
      const slotElement = element as SlotElementRenderable;
      return <SlotElementComponent partKey={partKey} element={slotElement} />;
    },
    [entityTypes.elements.text]: () => {
      const textElement = element as TextElementRenderable;
      return <TextElementComponent partKey={partKey} element={textElement} />;
    },
    [entityTypes.elements.media]: () => {
      const imageElement = element as MediaElementRenderable;
      return <MediaElementComponent partKey={partKey} element={imageElement} />;
    },
    [entityTypes.elements.vector]: () => {
      const vectorElement = element as VectorElementRenderable;
      return (
        <VectorElementComponent partKey={partKey} element={vectorElement} />
      );
    },
    [entityTypes.elements.page]: () => {
      const pageElement = element as PageElementRenderable;
      return <PageElementComponent partKey={partKey} element={pageElement} />;
    },
  });

  return (
    <>
      <ElementErrorBoundary element={element}>{content}</ElementErrorBoundary>
    </>
  );
});

export default ElementComponent;
