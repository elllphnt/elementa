import type { PropsWithChildren } from "react";
import {
  BaseElementPropsContext,
  useBaseElementProps,
} from "../base/context.js";

export function SlotVariantProvider({ children }: PropsWithChildren) {
  const currentProps = useBaseElementProps();

  // Slot elements default to div container
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
