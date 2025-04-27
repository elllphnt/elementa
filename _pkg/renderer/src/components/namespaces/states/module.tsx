import { useObservable } from "@elllphnt/elementa-utils";
import { ModuleStateInstance } from "@repo/elementa";
import { PropsWithChildren } from "react";
import { NamespaceContext } from "../../../contexts/namespace";
import { useNamespace } from "../../../hooks/namespace";

function UseModuleStateNamespaceProvider({
  children,
  state,
  use,
}: PropsWithChildren<{
  state: ModuleStateInstance;
  use?: (...args: any[]) => any;
}>): JSX.Element {
  console.log(
    `Rendering UseModuleStateNamespaceProvider ${state.entity.key} ${state.entity.name}`
  );

  const args = useObservable(state.entity.args$, state.entity.args);
  const name = useObservable(state.entity.name$, state.entity.name);
  const namespace = useNamespace({ clone: true });

  const resolvedArgs = args.map((arg) => {
    return namespace.resolveValue(arg);
  });
  let value: any;

  console.log(
    `UseModuleStateNamespaceProvider ${state.entity.key} ${state.entity.name} args:`,
    { resolvedArgs, args, namespace: { ...namespace.content } }
  );

  try {
    value = use?.(...resolvedArgs);
  } catch (e) {
    console.error(e);
  }

  namespace.set(state.namespaceKey, value);
  if (name) {
    namespace.set(["hooks", name], value);
  }

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
  state: ModuleStateInstance;
}>): JSX.Element {
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
