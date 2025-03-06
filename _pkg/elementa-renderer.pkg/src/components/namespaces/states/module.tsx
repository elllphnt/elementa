import { ModuleStateInstance } from "@repo/elementa";
import { useObservable } from "@repo/utils";
import { PropsWithChildren } from "react";
import { NamespaceContext } from "../../../contexts/namespace";
import { useNamespace } from "../../../hooks/namespace";

export function ModuleStateNamespaceProvider({
  children,
  state,
}: PropsWithChildren<{
  state: ModuleStateInstance;
}>): JSX.Element {
  const use = useObservable(state.use$, state.use);
  const args = useObservable(state.entity.args$, state.entity.args);
  const name = useObservable(state.entity.name$, state.entity.name);
  const namespace = useNamespace({ clone: true });

  const resolvedArgs = args.map((arg) => {
    return namespace.resolveValue(arg);
  });
  let value: any;

  try {
    value = use?.(...resolvedArgs);
  } catch (e) {
    console.error(e);
  }

  namespace.set(state.namespaceKey, value);
  if (name) {
    namespace.set(name, value);
  }

  return (
    <NamespaceContext.Provider value={namespace}>
      {children}
    </NamespaceContext.Provider>
  );
}
