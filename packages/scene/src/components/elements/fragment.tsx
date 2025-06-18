import { useObservable } from "@elllphnt/elementa-react-utils";
import React from "react";
import { useNamespace } from "../../hooks/namespace.js";
import { FragmentElementRenderable } from "../../renderables/_.js";

export function FragmentElementComponent({
  element,
}: {
  element: FragmentElementRenderable;
  onRef?: (element: HTMLElement | null, key?: string) => void;
}) {
  const namespace = useNamespace();
  const fragmentId = useObservable(
    element.instance.element.fragmentId$,
    element.instance.element.fragmentId
  );
  const params = useObservable(
    element.instance.element.params$,
    element.instance.element.params
  );

  const Fragment = fragmentId
    ? namespace.get<React.ComponentType<{ params: Record<string, any> }>>([
        "fragments",
        fragmentId,
      ])
    : undefined;

  if (!Fragment) {
    return <></>;
  }
  return <Fragment params={params} />;
}
