import { useObservable } from "@repo/utils";
import {
  ComponentElementRenderable,
  Renderable,
} from "~/src/renderables/instances/_";
import { FragmentComponent } from "../../_";
import { ComponentPlaceHolder } from "./placeholder";

export function ComponentElementComponentContent({
  element,
  onRef,
}: {
  element: ComponentElementRenderable;
  onRef?: (element: HTMLElement | null, key?: string) => void;
}): JSX.Element {
  const template = useObservable(element.template$, element.template);

  if (!template) {
    return <></>;
  }

  return <FragmentComponent fragment={template} isolated onRef={onRef} />;
}

export function ComponentElementComponent({
  element,
  data,
  onRef,
}: {
  element: ComponentElementRenderable;
  data?: any;
  onRef?: (element: HTMLElement | null) => void;
}): JSX.Element {
  const component = useObservable(
    element.entity.localComponent$,
    element.entity.localComponent,
  );
  const loaded = useObservable(component?.loaded$, component?.loaded);

  if (!loaded) {
    return (
      <ComponentPlaceHolder
        element={element}
        key="placeholder"
        component={component}
      />
    );
  } else {
    return (
      <ComponentElementComponentContent
        element={element}
        onRef={(e, key) => {
          element.setHtmlElement(key || Renderable.defaultHtmlElementKey, e);
          onRef?.(e);
        }}
      />
    );
  }
}

export default ComponentElementComponent;
