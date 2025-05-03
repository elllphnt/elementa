import { JSX, memo } from "react";
import { ComponentRenderable } from "../../renderables/component/component";

export const ComponentComponent = memo(function ({
  component,
}: {
  component: ComponentRenderable;
}): JSX.Element {
  return <div>COMPONENT RENDERED</div>;
});

export default ComponentComponent;
