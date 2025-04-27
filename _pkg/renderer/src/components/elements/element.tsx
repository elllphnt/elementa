import {
  entityTypes,
  Evaluable,
  switchEntityType,
} from "@elllphnt/elementa-base";
import { useObservable } from "@elllphnt/elementa-utils";
import { memo } from "react";
import { NamespaceContext } from "~/src/contexts/namespace";
import { useNamespace } from "~/src/hooks/namespace";
import {
  ComponentElementRenderable,
  MediaElementRenderable,
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
import PrimitiveElementComponent from "./primitive_element";
import { SlotElementComponent } from "./slot_element";
import TextElementComponent from "./text/text_element";
import VectorElementComponent from "./vector/vector_element";

function RawElement({
  element,
  onRef,
}: {
  element: ElementRenderable;
  onRef?: (element: HTMLElement | null, key?: string) => void;
}): JSX.Element {
  return switchEntityType(element.instance.entity.type, {
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
  });
}

function RepeatedElementItem({
  data,
  index,
  element,
  onRef,
}: {
  data?: any;
  index: number;
  element: ElementRenderable;
  onRef?: (element: HTMLElement | null, key?: string) => void;
}) {
  const namespace = useNamespace({ clone: true });
  namespace.set("$", {
    data,
    index,
  });
  namespace.set("index", index);
  namespace.set("item", data);

  return (
    <NamespaceContext.Provider key={namespace.key} value={namespace}>
      <RawElement
        element={element}
        onRef={(el) => {
          if (onRef) {
            onRef(el, `item_${index}`);
          }
        }}
      />
    </NamespaceContext.Provider>
  );
}

function FixedRepeatedElement({
  count,
  element,
  onRef,
}: {
  count?: Evaluable<number>;
  element: ElementRenderable;
  onRef?: (element: HTMLElement | null, key?: string) => void;
}) {
  const namespace = useNamespace();
  const resolvedCount = namespace.resolveValue(count) ?? 1;

  const children = new Array(resolvedCount).fill(null).map((_, index) => {
    return (
      <>
        <RepeatedElementItem
          key={index}
          index={index}
          element={element}
          onRef={onRef}
        />
      </>
    );
  });

  return <>{children}</>;
}

function DynamicRepeatedElement({
  dataset,
  element,
  onRef,
}: {
  dataset?: Evaluable<any[]>;
  element: ElementRenderable;
  onRef?: (element: HTMLElement | null, key?: string) => void;
}) {
  const namespace = useNamespace();
  const resolvedDataset = namespace.resolveValue(dataset);

  if (Array.isArray(resolvedDataset)) {
    return (
      <>
        {resolvedDataset.map((data, index) => {
          return (
            <RepeatedElementItem
              key={index}
              index={index}
              data={data}
              element={element}
              onRef={onRef}
            />
          );
        })}
      </>
    );
  } else {
    return <></>;
  }
}

function RepeatableElement({
  element,
  onRef,
}: {
  element: ElementRenderable;
  onRef?: (element: HTMLElement | null, key?: string) => void;
}): JSX.Element {
  const repeat = useObservable(
    element.instance.entity.repeat$,
    element.instance.entity.repeat
  );

  if (repeat?.mode) {
    switch (repeat.mode) {
      case "fixed":
        return (
          <FixedRepeatedElement
            count={repeat.count}
            element={element}
            onRef={onRef}
          />
        );
      case "dynamic":
        return (
          <DynamicRepeatedElement
            dataset={repeat.dataset}
            element={element}
            onRef={onRef}
          />
        );
    }
  } else {
    return <RawElement element={element} />;
  }
}

export const ElementComponent = memo(function ({
  element,
  onRef,
}: {
  element: ElementRenderable;
  onRef?: (element: HTMLElement | null, key?: string) => void;
}): JSX.Element {
  return (
    <>
      <ElementErrorBoundary element={element}>
        <RepeatableElement element={element} onRef={onRef} />
      </ElementErrorBoundary>
    </>
  );
});

export default ElementComponent;
