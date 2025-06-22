import { useObservable } from "@elllphnt/elementa-react-utils";
import { ValueStateInstance } from "@elllphnt/elementa-runtime";
import { PropsWithChildren, useState } from "react";
import { NamespaceContext } from "../../../contexts/namespace.js";
import { useNamespace } from "../../../hooks/namespace.js";

export function ValueStateNamespaceProvider({
  children,
  state,
}: PropsWithChildren<{
  state: ValueStateInstance;
}>) {
  const namespace = useNamespace({ clone: true });
  const initialValue = useObservable(state.model.init$, state.model.init);
  const varName = useObservable(state.model.varName$, state.model.varName);
  const resolvedInitialValue = namespace.resolveValue(initialValue);
  const [value, setValue] = useState(resolvedInitialValue);

  const namespaceValue = {
    value,
    setValue,
  };
  namespace.set(state.namespaceKey, namespaceValue);
  if (varName) {
    namespace.set([varName], namespaceValue);
  }

  return (
    <NamespaceContext.Provider value={namespace}>
      {children}
    </NamespaceContext.Provider>
  );
}
