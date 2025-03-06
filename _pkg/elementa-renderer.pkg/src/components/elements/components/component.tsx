import { entityTypes, switchEntityType } from "@elllphnt/elll-element";
import { memo } from "react";
import {
  CodeComponentElementRenderable,
  ComponentElementRenderable,
  ElllComponentElementRenderable,
} from "~/src/renderables/instances/_";
import CodeComponentElementComponent from "./code_component_element";
import ElllComponentElementComponent from "./elll_component_element";

export const ComponentElementComponent = memo(function ({
  element,
  data,
  partKey,
}: {
  element: ComponentElementRenderable;
  data?: any;
  partKey?: string;
}): JSX.Element {
  return switchEntityType(
    element.instance.entity.type,
    {
      [entityTypes.elements.components.elll]: () => {
        const componentElement = element as ElllComponentElementRenderable;
        return (
          <ElllComponentElementComponent
            partKey={partKey}
            element={componentElement}
          />
        );
      },
      [entityTypes.elements.components.code]: () => {
        const componentElement = element as CodeComponentElementRenderable;
        return (
          <CodeComponentElementComponent
            partKey={partKey}
            element={componentElement}
            data={data}
          />
        );
      },
    },
    () => {
      throw new Error(
        `Unsupported component type: ${element.instance.entity.type}`,
      );
    },
  );
});

export default ComponentElementComponent;
