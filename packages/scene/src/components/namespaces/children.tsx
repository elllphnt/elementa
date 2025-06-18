import React, { PropsWithChildren } from "react";
import { NamespaceContext } from "../../contexts/namespace.js";
import { useNamespace } from "../../hooks/namespace.js";

export function ChildrenNamespaceProvider({
  children,
  childrenProps,
}: PropsWithChildren<{
  childrenProps: React.ReactNode;
}>) {
  const namespace = useNamespace({ clone: true });
  namespace.set(["props", "children"], childrenProps);

  return (
    <NamespaceContext.Provider value={namespace}>
      {children}
    </NamespaceContext.Provider>
  );
}
