import { Evaluable } from "@elllphnt/elementa-base";
import { useObservable } from "@elllphnt/elementa-react-utils";
import { memo } from "react";
import { NamespaceContext } from "../../contexts/namespace";
import { useNamespace } from "../../hooks/namespace";
import { ComponentElementRenderable } from "../../renderables/element/component";
import { ContainerElementRenderable } from "../../renderables/element/container";
import { ElementRenderable } from "../../renderables/element/element";
import { MediaElementRenderable } from "../../renderables/element/media";
import { PrimitiveElementRenderable } from "../../renderables/element/primitive";
import { SlotElementRenderable } from "../../renderables/element/slot";
import { TextElementRenderable } from "../../renderables/element/text";
import { VectorElementRenderable } from "../../renderables/element/vector";
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
}) {
  switch (element.instance.element.type) {
    case "component": {
      const componentElement = element as ComponentElementRenderable;
      return (
        <ComponentElementComponent element={componentElement} onRef={onRef} />
      );
    }
    case "primitive": {
      const primitiveElement = element as PrimitiveElementRenderable;
      return (
        <PrimitiveElementComponent element={primitiveElement} onRef={onRef} />
      );
    }
    case "container": {
      const containerElement = element as ContainerElementRenderable;
      return (
        <ContainerElementComponent element={containerElement} onRef={onRef} />
      );
    }
    case "slot": {
      const slotElement = element as SlotElementRenderable;
      return <SlotElementComponent element={slotElement} onRef={onRef} />;
    }
    case "text": {
      const textElement = element as TextElementRenderable;
      return <TextElementComponent element={textElement} onRef={onRef} />;
    }
    case "media": {
      const imageElement = element as MediaElementRenderable;
      return <MediaElementComponent element={imageElement} onRef={onRef} />;
    }
    case "vector": {
      const vectorElement = element as VectorElementRenderable;
      return <VectorElementComponent element={vectorElement} onRef={onRef} />;
    }
    default:
      return null;
  }
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
}) {
  const repeat = useObservable(
    element.instance.element.repeat$,
    element.instance.element.repeat
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
    return (
      <>
        <RawElement element={element} />
      </>
    );
  }
}

export const ElementComponent = memo(function ({
  element,
  onRef,
}: {
  element: ElementRenderable;
  onRef?: (element: HTMLElement | null, key?: string) => void;
}) {
  return (
    <>
      <ElementErrorBoundary element={element}>
        <RepeatableElement element={element} onRef={onRef} />
      </ElementErrorBoundary>
    </>
  );
});

export default ElementComponent;
