import { useObservable } from "@elllphnt/elementa-react-utils";
import { JSX, memo } from "react";
import { ComponentRenderable } from "../../renderables/component/component.js";
import { ElementComponent } from "../elements/_.js";
import { FragmentEnvironmentNamespaceProvider } from "../namespaces/_.js";

export const ComponentComponent = memo(function ({
  component,
  onRef,
}: {
  component: ComponentRenderable;
  onRef?: (element: HTMLElement | null, key?: string) => void;
}): JSX.Element {
  const template = useObservable(component.template$, component.template);
  if (template) {
    return (
      <FragmentEnvironmentNamespaceProvider
        environment={component.instance.fragmentEnvironment}
      >
        <ElementComponent element={template} onRef={onRef} />
      </FragmentEnvironmentNamespaceProvider>
    );
  } else {
    return <></>;
  }
});

export default ComponentComponent;
