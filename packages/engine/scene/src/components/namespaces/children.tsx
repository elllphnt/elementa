import { logger } from "@elllphnt/elementa-kernel";
import type { PropsWithChildren } from "react";
import React from "react";
import { NamespaceContext } from "../../contexts/namespace.js";
import { useNamespace } from "../../hooks/namespace.js";

export function ChildrenNamespaceProvider({
  children,
  childrenProps,
}: PropsWithChildren<{
  childrenProps: React.ReactNode;
}>) {
  logger.debug("Rendering ChildrenNamespaceProvider", {
    children,
    childrenProps,
    hasChildrenProps: !!childrenProps,
  });

  const namespace = useNamespace({ clone: true });
  namespace.set(["props", "children"], childrenProps);

  logger.debug("ChildrenNamespaceProvider: Children props set in namespace", {
    childrenProps,
    namespaceKey: namespace.key,
  });

  return (
    <NamespaceContext.Provider value={namespace}>
      {children}
    </NamespaceContext.Provider>
  );
}
