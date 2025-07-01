import { PropsWithChildren } from "react";
import { PrimitiveElementRenderable } from "../../../renderables/element/primitive.js";
import {
  BaseElementPropsContext,
  useBaseElementProps,
} from "../base/context.js";

export function PrimitiveVariantProvider({ children }: PropsWithChildren) {
  const currentProps = useBaseElementProps();
  const element = currentProps.element as PrimitiveElementRenderable;

  // Primitive elements use their tag as the component
  const tag = element.instance.element.tag || "div";

  const updatedProps = {
    ...currentProps,
    component: tag,
  };

  return (
    <BaseElementPropsContext.Provider value={updatedProps}>
      {children}
    </BaseElementPropsContext.Provider>
  );
}
