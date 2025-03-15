import { useObservable } from "@repo/utils";
import { ComponentElementRenderable } from "~/src/renderables/instances/_";
import { FragmentComponent } from "../../_";
import { BaseElementComponent } from "../_/_base_element";
import { ComponentPlaceHolder } from "./placeholder";

export function ComponentElementComponentContent({
  element,
}: {
  element: ComponentElementRenderable;
}): JSX.Element {
  const template = useObservable(element.template$, element.template);

  if (!template) {
    return <></>;
  }

  return <FragmentComponent fragment={template} isolated />;
}

export function ComponentElementComponent({
  element,
  data,
  partKey,
}: {
  element: ComponentElementRenderable;
  data?: any;
  partKey?: string;
}): JSX.Element {
  const component = useObservable(
    element.entity.localComponent$,
    element.entity.localComponent,
  );
  const loaded = useObservable(component?.loaded$, component?.loaded);

  const naked = useObservable(
    element.entity.unwrapped$,
    element.entity.unwrapped,
  );

  if (!loaded && naked) {
    return <ComponentPlaceHolder key="placeholder" component={component} />;
  } else if (naked) {
    return (
      <>
        <ComponentElementComponentContent element={element} />
      </>
    );
  } else {
    return (
      <BaseElementComponent element={element} partKey={partKey}>
        <ComponentElementComponentContent element={element} />
      </BaseElementComponent>
    );
  }
}

export default ComponentElementComponent;
