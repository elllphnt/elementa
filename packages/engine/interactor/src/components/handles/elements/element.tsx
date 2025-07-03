import { memo } from "react";
import type { ComponentElementHandle } from "~/handles/renderables/element/component.js";
import type { ContainerElementHandle } from "~/handles/renderables/element/container.js";
import type { ElementHandle } from "~/handles/renderables/element/element.js";
import type { ExpressionElementHandle } from "~/handles/renderables/element/expression.js";
import type { FragmentElementHandle } from "~/handles/renderables/element/fragment.js";
import type { MediaElementHandle } from "~/handles/renderables/element/media.js";
import type { PrimitiveElementHandle } from "~/handles/renderables/element/primitive.js";
import type { SlotElementHandle } from "~/handles/renderables/element/slot.js";
import type { TextElementHandle } from "~/handles/renderables/element/text/text.js";
import type { VectorElementHandle } from "~/handles/renderables/element/vector.js";
import { ComponentElementHandleComponent } from "./component.js";
import { ContainerElementHandleComponent } from "./container.js";
import { ExpressionElementHandleComponent } from "./expression.js";
import { FragmentElementHandleComponent } from "./fragment.js";
import { MediaElementHandleComponent } from "./media.js";
import { PrimitiveElementHandleComponent } from "./primitive.js";
import { SlotElementHandleComponent } from "./slot.js";
import { TextElementHandleComponent } from "./text.js";
import { VectorElementHandleComponent } from "./vector.js";

export const ElementHandleComponent = memo(function ElementHandleComponent({
  element,
}: {
  element: ElementHandle;
}) {
  switch (element.renderable.instance.element.type) {
    case "component":
      return (
        <ComponentElementHandleComponent
          element={element as ComponentElementHandle}
        />
      );
    case "container":
      return (
        <ContainerElementHandleComponent
          element={element as ContainerElementHandle}
        />
      );
    case "media":
      return (
        <MediaElementHandleComponent element={element as MediaElementHandle} />
      );
    case "primitive":
      return (
        <PrimitiveElementHandleComponent
          element={element as PrimitiveElementHandle}
        />
      );
    case "slot":
      return (
        <SlotElementHandleComponent element={element as SlotElementHandle} />
      );
    case "vector":
      return (
        <VectorElementHandleComponent
          element={element as VectorElementHandle}
        />
      );
    case "text":
      return (
        <TextElementHandleComponent element={element as TextElementHandle} />
      );
    case "fragment":
      return (
        <FragmentElementHandleComponent
          element={element as FragmentElementHandle}
        />
      );
    case "expression":
      return (
        <ExpressionElementHandleComponent
          element={element as ExpressionElementHandle}
        />
      );
    default:
      console.warn(
        `Unknown element type: ${
          (element.renderable.instance.element as any).type
        }`
      );
      return null;
  }
});
