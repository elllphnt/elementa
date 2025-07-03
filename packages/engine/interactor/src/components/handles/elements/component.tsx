import { useObservable } from "@elllphnt/elementa-react-utils";
import type { ComponentElementHandle } from "~/handles/renderables/element/component.js";
import { ComponentHandleComponent } from "../component.js";

export function ComponentElementHandleComponent({
  element,
}: {
  element: ComponentElementHandle;
}) {
  const component = useObservable(element.component$, element.component);

  if (!component) {
    return <></>;
  }

  return <ComponentHandleComponent component={component} />;
}
