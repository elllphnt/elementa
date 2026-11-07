import { logger } from "@elllphnt/elementa-kernel";
import { useObservable } from "@elllphnt/elementa-react-utils";
import type { ComponentInstance } from "@elllphnt/elementa-runtime";
import { Namespace } from "@elllphnt/elementa-runtime";
import type { PropsWithChildren } from "react";
import { NamespaceContext } from "../../contexts/namespace.js";
import { useNamespace } from "../../hooks/namespace.js";

export function PropsNamespaceProvider({
  children,
  component,
}: PropsWithChildren<{
  component: ComponentInstance;
}>) {
  logger.debug("Rendering PropsNamespaceProvider", {
    component,
    children,
  });
  const upstreamNamespace = useNamespace();
  const downstreamNamespace = new Namespace();

  const propsValue = useObservable(component.props$, component.props);
  const propResolvedValues = upstreamNamespace.resolveValue(propsValue);
  downstreamNamespace.set(["props"], propResolvedValues);

  logger.debug("PropsNamespaceProvider: Namespace setup complete", {
    downstreamNamespace,
  });

  return (
    <NamespaceContext.Provider value={downstreamNamespace}>
      {children}
    </NamespaceContext.Provider>
  );
}
