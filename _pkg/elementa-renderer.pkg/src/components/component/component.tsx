import { memo } from "react";
import { ComponentRenderable } from "~/src/renderables/_";
import { FragmentComponent } from "../_";

export const ComponentComponent = memo(function ({
  component,
}: {
  component: ComponentRenderable;
}): JSX.Element {
  return <FragmentComponent fragment={component.template} />;
});

export default ComponentComponent;
