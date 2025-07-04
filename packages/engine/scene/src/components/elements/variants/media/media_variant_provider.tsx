import type { PropsWithChildren } from "react";
import {
  BaseElementPropsContext,
  useBaseElementProps,
} from "../../base/context.js";

export function MediaVariantProvider({ children }: PropsWithChildren) {
  const currentProps = useBaseElementProps();

  // Media elements will be handled by their specific components but need a container
  const updatedProps = {
    ...currentProps,
    component: "div",
  };

  return (
    <BaseElementPropsContext.Provider value={updatedProps}>
      {children}
    </BaseElementPropsContext.Provider>
  );
}
