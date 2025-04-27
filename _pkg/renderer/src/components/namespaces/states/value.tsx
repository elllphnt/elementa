import { useObservable } from "@elllphnt/elementa-utils";
import { ValueStateInstance } from "@repo/elementa";
import { PropsWithChildren, useState } from "react";
import { NamespaceContext } from "../../../contexts/namespace";
import { useNamespace } from "../../../hooks/namespace";

export function ValueStateNamespaceProvider({
  children,
  state,
}: PropsWithChildren<{
  state: ValueStateInstance;
}>): JSX.Element {
  const namespace = useNamespace({ clone: true });
  const initialValue = useObservable(
    state.entity.initialValue$,
    state.entity.initialValue
  );
  const name = useObservable(state.entity.name$, state.entity.name);
  const resolvedInitialValue = namespace.resolveValue(initialValue);
  const [value, setValue] = useState(resolvedInitialValue);

  const namespaceValue = {
    value,
    setValue,
  };
  namespace.set(state.namespaceKey, namespaceValue);
  if (name) {
    namespace.set(["hooks", name], namespaceValue);
  }

  return (
    <NamespaceContext.Provider value={namespace}>
      {children}
    </NamespaceContext.Provider>
  );
}
