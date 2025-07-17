import { useObservable } from "@elllphnt/elementa-react-utils";
import type { HookStateInstance } from "@elllphnt/elementa-runtime";
import type { PropsWithChildren } from "react";
import { NamespaceContext } from "../../../contexts/namespace.js";
import { useNamespace } from "../../../hooks/namespace.js";
import { renderingLogger } from "../../../loggers.js";

function UseHookStateNamespaceProvider({
  children,
  state,
  use,
}: PropsWithChildren<{
  state: HookStateInstance;
  use?: (...args: unknown[]) => unknown;
}>) {
  const args = useObservable(state.model.args$, state.model.args);
  const name = useObservable(state.model.name$, state.model.name);
  const namespace = useNamespace({ clone: true });

  let value: unknown;

  try {
    const resolvedArgs = namespace.resolveValue(value) as any[];
    value = use?.(...(resolvedArgs || []));
  } catch (e) {
    renderingLogger.error(
      "UseHookStateNamespaceProvider: Hook execution failed",
      {
        error: e,
      }
    );
  }

  namespace.set(state.namespaceKey, value);
  if (name) {
    namespace.set([name], value);
  }

  renderingLogger.debug(
    `UseHookStateNamespaceProvider ${name} (${state.model.id})`,
    {
      children,
      state,
      use,
      args,
      name,
      namespace,
      value,
    }
  );

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

  renderingLogger.debug("HookStateNamespaceProvider", {
    use,
    state,
  });

  if (!use) {
    return <>Loading Hook State...</>;
  }

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
