import { Evaluable } from "@elllphnt/elementa-base";
import { logger } from "@elllphnt/elementa-kernel";
import { useObservable } from "@elllphnt/elementa-react-utils";
import { memo } from "react";
import { NamespaceContext } from "../../contexts/namespace.js";
import { useNamespace } from "../../hooks/namespace.js";
import { ComponentElementRenderable } from "../../renderables/element/component.js";
import { ContainerElementRenderable } from "../../renderables/element/container.js";
import { ElementRenderable } from "../../renderables/element/element.js";
import { ExpressionElementRenderable } from "../../renderables/element/expression.js";
import { FragmentElementRenderable } from "../../renderables/element/fragment.js";
import { MediaElementRenderable } from "../../renderables/element/media.js";
import { PrimitiveElementRenderable } from "../../renderables/element/primitive.js";
import { SlotElementRenderable } from "../../renderables/element/slot.js";
import { TextElementRenderable } from "../../renderables/element/text.js";
import { VectorElementRenderable } from "../../renderables/element/vector.js";
import { ElementErrorBoundary } from "./_/_error_boundary.js";
import ComponentElementComponent from "./components/component_element.js";
import { ContainerElementComponent } from "./container_element.js";
import { ExpressionElementComponent } from "./expression.js";
import { FragmentElementComponent } from "./fragment.js";
import { MediaElementComponent } from "./media/media_element.js";
import PrimitiveElementComponent from "./primitive_element.js";
import { SlotElementComponent } from "./slot_element.js";
import TextElementComponent from "./text/text_element.js";
import VectorElementComponent from "./vector/vector_element.js";

function RawElement({
  element,
  onRef,
}: {
  element: ElementRenderable;
  onRef?: (element: HTMLElement | null, key?: string) => void;
}) {
  logger.debug("Rendering RawElement", {
    elementType: element.instance.element.type,
    element,
    onRef,
  });

  switch (element.instance.element.type) {
    case "component": {
      const componentElement = element as ComponentElementRenderable;
      logger.debug("RawElement: Rendering component element", {
        componentElement,
      });
      return (
        <ComponentElementComponent element={componentElement} onRef={onRef} />
      );
    }
    case "primitive": {
      const primitiveElement = element as PrimitiveElementRenderable;
      logger.debug("RawElement: Rendering primitive element", {
        primitiveElement,
      });
      return (
        <PrimitiveElementComponent element={primitiveElement} onRef={onRef} />
      );
    }
    case "container": {
      const containerElement = element as ContainerElementRenderable;
      logger.debug("RawElement: Rendering container element", {
        containerElement,
      });
      return (
        <ContainerElementComponent element={containerElement} onRef={onRef} />
      );
    }
    case "slot": {
      const slotElement = element as SlotElementRenderable;
      logger.debug("RawElement: Rendering slot element", { slotElement });
      return <SlotElementComponent element={slotElement} onRef={onRef} />;
    }
    case "text": {
      const textElement = element as TextElementRenderable;
      logger.debug("RawElement: Rendering text element", { textElement });
      return <TextElementComponent element={textElement} onRef={onRef} />;
    }
    case "media": {
      const imageElement = element as MediaElementRenderable;
      logger.debug("RawElement: Rendering media element", { imageElement });
      return <MediaElementComponent element={imageElement} onRef={onRef} />;
    }
    case "vector": {
      const vectorElement = element as VectorElementRenderable;
      logger.debug("RawElement: Rendering vector element", { vectorElement });
      return <VectorElementComponent element={vectorElement} onRef={onRef} />;
    }
    case "fragment": {
      const fragmentElement = element as FragmentElementRenderable;
      logger.debug("RawElement: Rendering fragment element", {
        fragmentElement,
      });
      return (
        <FragmentElementComponent element={fragmentElement} onRef={onRef} />
      );
    }
    case "expression": {
      const expressionElement = element as ExpressionElementRenderable;
      logger.debug("RawElement: Rendering expression element", {
        expressionElement,
      });
      return (
        <ExpressionElementComponent element={expressionElement} onRef={onRef} />
      );
    }
    default:
      logger.warn("RawElement: Unknown element type", { element });
      return null;
  }
}

function RepeatedElementItem({
  data,
  index,
  element,
  onRef,
}: {
  data?: unknown;
  index: number;
  element: ElementRenderable;
  onRef?: (element: HTMLElement | null, key?: string) => void;
}) {
  logger.debug("Rendering RepeatedElementItem", { data, index, element });

  const namespace = useNamespace({ clone: true });
  namespace.set("$", {
    data,
    index,
  });
  namespace.set("index", index);
  namespace.set("item", data);

  logger.debug("RepeatedElementItem: Namespace set", {
    namespaceKey: namespace.key,
    data,
    index,
  });

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
  const resolvedCount = namespace.resolveValue<number | undefined>(count) ?? 1;

  logger.debug("Rendering FixedRepeatedElement", {
    count,
    resolvedCount,
    element,
  });

  const children = new Array<null>(resolvedCount).fill(null).map((_, index) => {
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
  dataset?: Evaluable<unknown[]>;
  element: ElementRenderable;
  onRef?: (element: HTMLElement | null, key?: string) => void;
}) {
  const namespace = useNamespace();
  const resolvedDataset = namespace.resolveValue(dataset);

  logger.debug("Rendering DynamicRepeatedElement", {
    dataset,
    resolvedDataset,
    isArray: Array.isArray(resolvedDataset),
    element,
  });

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
    logger.warn("DynamicRepeatedElement: Dataset is not an array", {
      resolvedDataset,
      element,
    });
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

  logger.debug("Rendering RepeatableElement", {
    repeat,
    element,
    hasRepeat: !!repeat?.mode,
  });

  if (repeat?.mode) {
    switch (repeat.mode) {
      case "fixed":
        logger.debug("RepeatableElement: Using fixed repeat mode", { repeat });
        return (
          <FixedRepeatedElement
            count={repeat.count}
            element={element}
            onRef={onRef}
          />
        );
      case "dynamic":
        logger.debug("RepeatableElement: Using dynamic repeat mode", {
          repeat,
        });
        return (
          <DynamicRepeatedElement
            dataset={repeat.dataset}
            element={element}
            onRef={onRef}
          />
        );
    }
  } else {
    logger.debug("RepeatableElement: No repeat mode, rendering single element");
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
  logger.debug("Rendering ElementComponent", {
    elementType: element.instance.element.type,
    elementKey: element.key,
    element,
    onRef,
  });

  return (
    <>
      <ElementErrorBoundary element={element}>
        <RepeatableElement element={element} onRef={onRef} />
      </ElementErrorBoundary>
    </>
  );
});

export default ElementComponent;
