import { logger } from "@elllphnt/elementa-kernel";
import {
  useManyObservables,
  useObservable,
} from "@elllphnt/elementa-react-utils";
import { PropsWithChildren } from "react";
import { NamespaceContext } from "../../contexts/namespace.js";
import { useNamespace } from "../../hooks/namespace.js";
import { ComponentRenderable } from "../../renderables/component/component.js";
import { FragmentComponent } from "../fragment/fragment.js";

export function FragmentsNamespaceProvider({
  children,
  component,
}: PropsWithChildren<{
  component: ComponentRenderable;
}>) {
  logger.debug("Rendering FragmentsNamespaceProvider", {
    component,
    children,
  });

  const namespace = useNamespace({ clone: true });

  const fragments =
    useObservable(component.fragments$, component.fragments) ?? [];
  const propsKey = fragments.map((prop) => prop.key).join(".");

  logger.debug("FragmentsNamespaceProvider: Fragments resolved", {
    fragments,
    propsKey,
    fragmentCount: fragments.length,
  });

  const fragmentVarNames = useManyObservables(
    fragments.map((fragment) => fragment.instance.model.varName$),
    fragments.map((fragment) => fragment.instance.model.varName),
    propsKey
  );

  logger.debug("FragmentsNamespaceProvider: Fragment var names resolved", {
    fragmentVarNames,
  });

  for (let i = 0; i < fragments.length; i++) {
    const fragment = fragments[i];
    const varName = fragmentVarNames[i];
    const value = (params: Record<string, any>) => {
      logger.debug("FragmentsNamespaceProvider: Fragment function called", {
        fragmentId: fragment.instance.model.id,
        varName,
        params,
      });
      return <FragmentComponent fragment={fragment} params={params} />;
    };

    logger.debug("FragmentsNamespaceProvider: Setting fragment in namespace", {
      fragmentId: fragment.instance.model.id,
      varName,
      hasVarName: !!varName,
    });

    namespace.set(["fragments", fragment.instance.model.id], value);
    if (varName) {
      namespace.set(["fragments", varName], value);
    }
  }

  logger.debug("FragmentsNamespaceProvider: All fragments set in namespace", {
    fragmentCount: fragments.length,
    namespaceKey: namespace.key,
  });

  return (
    <NamespaceContext.Provider value={namespace}>
      {children}
    </NamespaceContext.Provider>
  );
}
