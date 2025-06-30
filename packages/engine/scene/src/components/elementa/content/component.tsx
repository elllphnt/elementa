import { useObservable } from "@elllphnt/elementa-react-utils";
import { JSX } from "react";
import { ComponentRenderableContentRenderable } from "../../../renderables/elementa/renderable_content/component.js";
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

  if (!component) {
    return <div>Component not found</div>;
  } else {
    return <ComponentComponent component={component} />;
  }
}
