import { useObservable } from "@elllphnt/elementa-react-utils";
import type { ComponentHandle } from "~/handles/renderables/component.js";
import { ElementHandleComponent } from "./elements/element.js";

export function ComponentHandleComponent({
  component,
}: {
  component: ComponentHandle;
}) {
  const template = useObservable(component.template$, component.template);

  if (!template) {
    return <></>;
  }

  return <ElementHandleComponent element={template} />;
}
