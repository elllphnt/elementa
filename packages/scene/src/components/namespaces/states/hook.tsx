import { useObservable } from "@elllphnt/elementa-react-utils";
import { HookStateInstance } from "@elllphnt/elementa-runtime";
import { PropsWithChildren } from "react";
import { NamespaceContext } from "../../../contexts/namespace.js";
import { useNamespace } from "../../../hooks/namespace.js";

function UseHookStateNamespaceProvider({
  children,
  state,
  use,
}: PropsWithChildren<{
  state: HookStateInstance;
  use?: (...args: unknown[]) => unknown;
}>) {
  const args = useObservable(state.model.args$, state.model.args);
  const argMode = useObservable(state.model.argMode$, state.model.argMode);
  const varName = useObservable(state.model.varName$, state.model.varName);
  const namespace = useNamespace({ clone: true });

  let value: unknown;

  try {
    console.log("UseHookStateNamespaceProvider", {
      args,
      argMode,
      varName,
      use,
      module: state.module,
      resolved: state.module?.resolved,
      error: state.module?.error,
    });
    if (argMode === "named") {
      const resolvedArgs = {} as Record<string, any>;
      for (const [key, value] of Object.entries(args)) {
        resolvedArgs[key] = namespace.resolveValue(value);
      }
      value = use?.(resolvedArgs);
    } else {
      const resolvedArgs = [] as any[];
      for (const [, value] of Object.entries(args).sort((a, b) => {
        return a[0].localeCompare(b[0]);
      })) {
        resolvedArgs.push(namespace.resolveValue(value));
      }
      value = use?.(...resolvedArgs);
    }
  } catch (e) {
    console.error(e);
  }

  namespace.set(state.namespaceKey, value);
  if (varName) {
    namespace.set([varName], value);
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
