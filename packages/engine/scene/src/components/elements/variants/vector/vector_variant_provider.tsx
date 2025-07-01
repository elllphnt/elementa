import { PropsWithChildren } from "react";
import {
  BaseElementPropsContext,
  useBaseElementProps,
} from "../../base/context.js";

export function VectorVariantProvider({ children }: PropsWithChildren) {
  const currentProps = useBaseElementProps();

  // Vector elements default to div container
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
