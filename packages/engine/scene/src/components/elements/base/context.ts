import React, { createContext } from "react";
import { ElementRenderable } from "../../../renderables/element/element.js";

export type BaseElementProps<E extends ElementRenderable = ElementRenderable> =
  {
    element: E;
    component?: string | React.ComponentType | null;
    onRef?: (element: HTMLElement | null, key?: string) => void;
    children?: React.ReactNode;
    style?: React.CSSProperties;
    className?: string;
  };

export const BaseElementPropsContext = createContext<BaseElementProps | null>(
  null
);

export function useBaseElementProps<E extends ElementRenderable>() {
  const context = React.useContext(BaseElementPropsContext);
  if (!context) {
    throw new Error(
      "useBaseElementProps must be used within a BaseElementPropsProvider"
    );
  }
  return context as BaseElementProps<E>;
}
