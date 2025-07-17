import { logger } from "@elllphnt/elementa-kernel";
import { useObservable } from "@elllphnt/elementa-react-utils";
import type { PropsWithChildren } from "react";
import { NamespaceContext } from "../../contexts/namespace.js";
import { useNamespace } from "../../hooks/namespace.js";
import type { ComponentRenderable } from "../../renderables/component/component.js";
import { FragmentComponent } from "../fragment/fragment.js";

export function FragmentsNamespaceProvider({
  children,
  component,
}: PropsWithChildren<{
  component: ComponentRenderable;
}>) {
  const namespace = useNamespace({ clone: true });

  const fragments =
    useObservable(component.fragments$, component.fragments) ?? [];

  for (let i = 0; i < fragments.length; i++) {
    const fragment = fragments[i];
    const value = (params: Record<string, any> = {}) => {
      return <FragmentComponent fragment={fragment} params={params} />;
    };

    namespace.set(["fragments", fragment.instance.model.id], value);
  }

  logger.debug("FragmentsNamespaceProvider", {
    fragments,
    namespace,
    component,
  });

  return (
    <NamespaceContext.Provider value={namespace}>
      {children}
    </NamespaceContext.Provider>
  );
}
