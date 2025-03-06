import { useObservable } from "@repo/utils";
import { ElllComponentElementRenderable } from "../../../renderables/instances/element/components/elll_component";
import { FragmentComponent } from "../../fragment/fragment";
import { BaseElementComponent } from "../_/_base_element";
import { ComponentPlaceHolder } from "./placeholder";

export function ElllComponentElementComponent({
  element,
  partKey,
}: {
  element: ElllComponentElementRenderable;
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
        <ElllComponentElementComponentContent element={element} />
      </>
    );
  } else {
    return (
      <BaseElementComponent element={element} partKey={partKey}>
        <ElllComponentElementComponentContent element={element} />
      </BaseElementComponent>
    );
  }
}

export function ElllComponentElementComponentContent({
  element,
}: {
  element: ElllComponentElementRenderable;
}): JSX.Element {
  const template = useObservable(element.template$, element.template);

  if (!template) {
    return <></>;
  }

  return <FragmentComponent fragment={template} isolated />;
}

export default ElllComponentElementComponent;
