import { logger } from "@elllphnt/elementa-kernel";
import { useObservable } from "@elllphnt/elementa-react-utils";
import { JSX, memo, PropsWithChildren } from "react";
import { renderingLogger } from "../../loggers.js";
import { ComponentRenderable } from "../../renderables/component/component.js";
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
  const template = useObservable(component.template$, component.template);

  renderingLogger.debug(
    `ComponentComponent ${
      component.instance.model.name || component.instance.model.url
    }`,
    {
      component,
      onRef,
      children,
      template,
    }
  );

  if (template) {
    return (
      <PropsNamespaceProvider component={component.instance}>
        <ChildrenNamespaceProvider childrenProps={children}>
          <FragmentsNamespaceProvider component={component}>
            <StatesNamespaceProvider component={component.instance}>
              <ElementComponent element={template} onRef={onRef} />
            </StatesNamespaceProvider>
          </FragmentsNamespaceProvider>
        </ChildrenNamespaceProvider>
      </PropsNamespaceProvider>
    );
  } else {
    logger.warn(
      "Component template is not available, rendering empty component.",
      component
    );
    return <></>;
  }
});

export default ComponentComponent;
