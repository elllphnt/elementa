import { PropsWithChildren } from "react";
import { renderingLogger } from "../../../loggers.js";
import { useBaseElementProps } from "../base/context.js";
import { ComponentVariantProvider } from "../variants/component.js";
import { ContainerVariantProvider } from "../variants/container.js";
import { ExpressionVariantProvider } from "../variants/expression.js";
import { FragmentVariantProvider } from "../variants/fragment.js";
import { MediaVariantProvider } from "../variants/media/media_variant_provider.js";
import { PrimitiveVariantProvider } from "../variants/primitive_variant_provider.js";
import { SlotVariantProvider } from "../variants/slot_variant_provider.js";
import { TextVariantProvider } from "../variants/text/text.js";
import { VectorVariantProvider } from "../variants/vector/vector_variant_provider.js";

export function ElementVariantProvider({ children }: PropsWithChildren) {
  const props = useBaseElementProps();
  const { element } = props;

  renderingLogger.debug("ElementVariantProvider", {
    type: element.instance.element.type,
    props,
  });

  switch (element.instance.element.type) {
    case "component":
      return <ComponentVariantProvider>{children}</ComponentVariantProvider>;
    case "primitive":
      return <PrimitiveVariantProvider>{children}</PrimitiveVariantProvider>;
    case "container":
      return <ContainerVariantProvider>{children}</ContainerVariantProvider>;
    case "slot":
      return <SlotVariantProvider>{children}</SlotVariantProvider>;
    case "text":
      return <TextVariantProvider>{children}</TextVariantProvider>;
    case "media":
      return <MediaVariantProvider>{children}</MediaVariantProvider>;
    case "vector":
      return <VectorVariantProvider>{children}</VectorVariantProvider>;
    case "fragment":
      return <FragmentVariantProvider>{children}</FragmentVariantProvider>;
    case "expression":
      return <ExpressionVariantProvider>{children}</ExpressionVariantProvider>;
    default:
      throw new Error(
        `Unknown element type: ${
          (element.instance.element as any).type
        } for element ${element.key}`
      );
  }
}
