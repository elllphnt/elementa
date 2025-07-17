import { logger } from "@elllphnt/elementa-kernel";
import { useObservable } from "@elllphnt/elementa-react-utils";
import type { ValueStateInstance } from "@elllphnt/elementa-runtime";
import type { PropsWithChildren } from "react";
import { useState } from "react";
import { NamespaceContext } from "../../../contexts/namespace.js";
import { useNamespace } from "../../../hooks/namespace.js";

export function ValueStateNamespaceProvider({
  children,
  state,
}: PropsWithChildren<{
  state: ValueStateInstance;
}>) {
  logger.debug("Rendering ValueStateNamespaceProvider", { state });

  const namespace = useNamespace({ clone: true });
  const initialValue = useObservable(state.model.init$, state.model.init);
  const name = useObservable(state.model.name$, state.model.name);
  const resolvedInitialValue = namespace.resolveValue(initialValue);

  logger.debug("ValueStateNamespaceProvider: Values resolved", {
    initialValue,
    name,
    resolvedInitialValue,
    namespaceKey: state.namespaceKey,
  });

  const [value, setValue] = useState(resolvedInitialValue);

  const namespaceValue = {
    value,
    setValue,
  };

  namespace.set(state.namespaceKey, namespaceValue);
  if (name) {
    namespace.set([name], namespaceValue);
    logger.debug("ValueStateNamespaceProvider: Set state with varName", {
      name,
      namespaceValue,
    });
  }

  logger.debug("ValueStateNamespaceProvider: State set in namespace", {
    namespaceKey: state.namespaceKey,
    namespaceValue,
  });

  return (
    <NamespaceContext.Provider value={namespace}>
      {children}
    </NamespaceContext.Provider>
  );
}
