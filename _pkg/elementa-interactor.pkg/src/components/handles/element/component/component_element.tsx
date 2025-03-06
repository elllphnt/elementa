import { entityTypes, switchEntityType } from "@elllphnt/elll-element";
import { ComponentElementHandle } from "~/src/handles/_";
import { CodeComponentElementHandleComponent } from "./code_component_element";
import { ElllComponentElementHandleComponent } from "./elll_component_element";

export function ComponentElementHandleComponent({
  element,
}: {
  element: ComponentElementHandle;
}) {
  return switchEntityType(
    element.entity.type,
    {
      [entityTypes.elements.components.elll]: () => (
        <ElllComponentElementHandleComponent element={element as any} />
      ),
      [entityTypes.elements.components.code]: () => (
        <CodeComponentElementHandleComponent element={element as any} />
      ),
    },
    () => <></>,
  );
}
