import { logger } from "@elllphnt/elementa-kernel";
import { useObservable } from "@elllphnt/elementa-react-utils";
import React from "react";
import { useNamespace } from "../../hooks/namespace.js";
import { FragmentElementRenderable } from "../../renderables/element/fragment.js";

export function FragmentElementComponent({
  element,
}: {
  element: FragmentElementRenderable;
  onRef?: (element: HTMLElement | null, key?: string) => void;
}) {
  logger.debug("Rendering FragmentElementComponent", { element });

  const namespace = useNamespace();
  const fragmentId = useObservable(
    element.instance.element.fragmentId$,
    element.instance.element.fragmentId
  );
  const params = useObservable(
    element.instance.element.params$,
    element.instance.element.params
  );

  logger.debug("FragmentElementComponent: Values resolved", {
    fragmentId,
    params,
    hasFragmentId: !!fragmentId,
  });

  const Fragment = fragmentId
    ? namespace.get<React.ComponentType<{ params: Record<string, any> }>>([
        "fragments",
        fragmentId,
      ])
    : undefined;

  logger.debug("FragmentElementComponent: Fragment resolved from namespace", {
    fragmentId,
    Fragment,
    hasFragment: !!Fragment,
    namespacePath: ["fragments", fragmentId],
  });

  if (!Fragment) {
    logger.warn(
      "FragmentElementComponent: No fragment found, rendering empty",
      {
        fragmentId,
        availableFragments: Object.keys(namespace.get(["fragments"]) || {}),
      }
    );
    return <></>;
  }

  logger.debug("FragmentElementComponent: Rendering fragment", {
    fragmentId,
    params,
  });

  return <Fragment params={params} />;
}
