import { useObservable } from "@elllphnt/elementa-react-utils";
import type { JSX, PropsWithChildren } from "react";
import { memo } from "react";
import { renderingLogger } from "../../loggers.js";
import type { ComponentRenderable } from "../../renderables/component/component.js";
import ElementComponent from "../elements/element.js";
import { ChildrenNamespaceProvider } from "../namespaces/children.js";
import { FragmentsNamespaceProvider } from "../namespaces/fragments.js";
import { PropsNamespaceProvider } from "../namespaces/props.js";
import { StatesNamespaceProvider } from "../namespaces/states/states.js";

export const ComponentComponent = memo(function ({
  component,
  onRef,
  children,
}: PropsWithChildren<{
  component: ComponentRenderable;
  onRef?: (element: HTMLElement | null, key?: string) => void;
}>): JSX.Element {
  const content = useObservable(component.content$, component.content);

  renderingLogger.debug(
    `ComponentComponent ${
      component.instance.model.name || component.instance.model.url
    }`,
    {
      component,
      onRef,
      children,
      content,
    }
  );

  return (
    <PropsNamespaceProvider component={component.instance}>
      <ChildrenNamespaceProvider childrenProps={children}>
        <FragmentsNamespaceProvider component={component}>
          <StatesNamespaceProvider component={component.instance}>
            {content.map((element) => (
              <ElementComponent key={element.key} element={element} />
            ))}
          </StatesNamespaceProvider>
        </FragmentsNamespaceProvider>
      </ChildrenNamespaceProvider>
    </PropsNamespaceProvider>
  );
});

export default ComponentComponent;
