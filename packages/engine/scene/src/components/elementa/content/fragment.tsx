import { useObservable } from "@elllphnt/elementa-react-utils";
import type { JSX } from "react";
import type { FragmentRenderableContentRenderable } from "../../../renderables/elementa/renderable_content/fragment.js";
import { FragmentComponent } from "../../fragment/fragment.js";

export function FragmentRenderableContentComponent({
  content,
}: {
  content: FragmentRenderableContentRenderable;
}): JSX.Element {
  const fragment = useObservable(
    content.fragmentContent$,
    content.fragmentContent
  );
  const params =
    useObservable(
      content.instance.model.params$,
      content.instance.model.params
    ) || {};

  if (!fragment) {
    return <div>Fragment not found</div>;
  } else {
    return <FragmentComponent fragment={fragment} params={params} />;
  }
}
