import { useObservable } from "@elllphnt/elementa-react-utils";
import { HookStateInstance } from "@elllphnt/elementa-runtime";
import { PropsWithChildren } from "react";
import { NamespaceContext } from "../../../contexts/namespace";
import { useNamespace } from "../../../hooks/namespace";

function UseHookStateNamespaceProvider({
  children,
  state,
  use,
}: PropsWithChildren<{
  state: HookStateInstance;
  use?: (...args: unknown[]) => unknown;
}>) {
  const args = useObservable(state.state.args$, state.state.args);
  const varName = useObservable(state.state.varName$, state.state.varName);
  const namespace = useNamespace({ clone: true });

  const resolvedArgs = args.map((arg) => {
    return namespace.resolveValue(arg);
  });
  let value: unknown;

  try {
    value = use?.(...resolvedArgs);
  } catch (e) {
    console.error(e);
  }

  namespace.set(state.namespaceKey, value);
  if (varName) {
    namespace.set(["states", varName], value);
  }

  return (
    <NamespaceContext.Provider value={namespace}>
      {children}
    </NamespaceContext.Provider>
  );
}

export function HookStateNamespaceProvider({
  children,
  state,
}: PropsWithChildren<{
  state: HookStateInstance;
}>) {
  const use = useObservable(state.use$, state.use);

  return (
    <UseHookStateNamespaceProvider
      state={state}
      use={use}
      key={use ? "use" : "no_use"}
    >
      {children}
    </UseHookStateNamespaceProvider>
  );
}
