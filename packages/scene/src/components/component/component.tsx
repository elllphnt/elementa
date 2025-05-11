import { JSX, memo } from "react";
import { ComponentRenderable } from "../../renderables/component/component.js";
import { FragmentComponent } from "../fragment/fragment.js";

export const ComponentComponent = memo(function ({
  component,
  onRef,
}: {
  component: ComponentRenderable;
  onRef?: (element: HTMLElement | null, key?: string) => void;
}): JSX.Element {
  return (
    <FragmentComponent fragment={component.template} onRef={onRef} isolated />
  );
});

export default ComponentComponent;
