import { logger } from "@elllphnt/elementa-kernel";
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
  logger.debug("Rendering UseHookStateNamespaceProvider", { state, use });

  const args = useObservable(state.model.args$, state.model.args);
  const argMode = useObservable(state.model.argMode$, state.model.argMode);
  const varName = useObservable(state.model.varName$, state.model.varName);
  const namespace = useNamespace({ clone: true });

  let value: unknown;

  try {
    logger.debug("UseHookStateNamespaceProvider: Hook execution", {
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
      logger.debug("UseHookStateNamespaceProvider: Named args resolved", {
        resolvedArgs,
      });
      value = use?.(resolvedArgs);
    } else {
      const resolvedArgs = [] as any[];
      for (const [, value] of Object.entries(args).sort((a, b) => {
        return a[0].localeCompare(b[0]);
      })) {
        resolvedArgs.push(namespace.resolveValue(value));
      }
      logger.debug("UseHookStateNamespaceProvider: Positional args resolved", {
        resolvedArgs,
      });
      value = use?.(...resolvedArgs);
    }

    logger.debug("UseHookStateNamespaceProvider: Hook executed successfully", {
      value,
    });
  } catch (e) {
    logger.error("UseHookStateNamespaceProvider: Hook execution failed", {
      error: e,
    });
  }

  namespace.set(state.namespaceKey, value);
  if (varName) {
    namespace.set([varName], value);
    logger.debug("UseHookStateNamespaceProvider: Set hook state with varName", {
      varName,
      value,
    });
  }

  logger.debug("UseHookStateNamespaceProvider: Hook state set in namespace", {
    namespaceKey: state.namespaceKey,
    value,
  });

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
  logger.debug("Rendering HookStateNamespaceProvider", { state });

  const use = useObservable(state.use$, state.use);

  logger.debug("HookStateNamespaceProvider: Hook function resolved", {
    use,
    hasUse: !!use,
  });

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
