import { useObservable } from "@elllphnt/elementa-react-utils";
import { HookStateInstance } from "@elllphnt/elementa-runtime";
import { PropsWithChildren } from "react";
import { NamespaceContext } from "../../../contexts/namespace";
import { useNamespace } from "../../../hooks/namespace";

function UseModuleStateNamespaceProvider({
  children,
  state,
  use,
}: PropsWithChildren<{
  state: HookStateInstance;
  use?: (...args: any[]) => any;
}>) {
  const args = useObservable(state.state.args$, state.state.args);
  // const name = useObservable(state.state.name$, state.state.name);
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
  // if (name) {
  //   namespace.set(["hooks", name], value);
  // }

  return (
    <NamespaceContext.Provider value={namespace}>
      {children}
    </NamespaceContext.Provider>
  );
}

export function ModuleStateNamespaceProvider({
  children,
  state,
}: PropsWithChildren<{
  state: HookStateInstance;
}>) {
  const use = useObservable(state.use$, state.use);

  return (
    <UseModuleStateNamespaceProvider
      state={state}
      use={use}
      key={use ? "use" : "no_use"}
    >
      {children}
    </UseModuleStateNamespaceProvider>
  );
}
