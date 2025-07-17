import { useObservable } from "@elllphnt/elementa-react-utils";
import type { JSX } from "react";
import type { ComponentRenderableContentRenderable } from "../../../renderables/elementa/renderable_content/component.js";
import ComponentComponent from "../../component/component.js";

export function ComponentRenderableContentComponent({
  content,
}: {
  content: ComponentRenderableContentRenderable;
}): JSX.Element {
  const component = useObservable(
    content.componentContent$,
    content.componentContent
  );

  console.log("ComponentRenderableContentComponent", {
    component,
    content,
  });

  if (!component) {
    return <div>Component not found</div>;
  } else {
    return <ComponentComponent component={component} />;
  }
}
