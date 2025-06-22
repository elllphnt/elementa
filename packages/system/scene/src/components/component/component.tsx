import { useObservable } from "@elllphnt/elementa-react-utils";
import { JSX, memo, PropsWithChildren } from "react";
import { ComponentRenderable } from "../../renderables/component/component.js";
import { ElementComponent } from "../elements/_.js";
import {
  PropsNamespaceProvider,
  StatesNamespaceProvider,
} from "../namespaces/_.js";
import { ChildrenNamespaceProvider } from "../namespaces/children.js";
import { FragmentsNamespaceProvider } from "../namespaces/fragments.js";

export const ComponentComponent = memo(function ({
  component,
  onRef,
  children,
}: PropsWithChildren<{
  component: ComponentRenderable;
  onRef?: (element: HTMLElement | null, key?: string) => void;
}>): JSX.Element {
  const template = useObservable(component.template$, component.template);
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
    return <></>;
  }
});

export default ComponentComponent;
