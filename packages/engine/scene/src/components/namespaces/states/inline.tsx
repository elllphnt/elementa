import { logger } from "@elllphnt/elementa-kernel";
import { useObservable } from "@elllphnt/elementa-react-utils";
import { InlineStateInstance } from "@elllphnt/elementa-runtime";
import { PropsWithChildren } from "react";
import { NamespaceContext } from "../../../contexts/namespace.js";
import { useNamespace } from "../../../hooks/namespace.js";

function InnerInlineStateNamespaceProvider({
  state,
  script,
  varName,
  children,
}: PropsWithChildren<{
  state: InlineStateInstance;
  script: string;
  varName?: string;
}>) {
  logger.debug("Rendering InnerInlineStateNamespaceProvider", {
    state,
    script,
    varName,
  });

  const namespace = useNamespace({ clone: true });
  let value: unknown;

  try {
    const expression = `(()=>{${script}})()`;
    logger.debug("InnerInlineStateNamespaceProvider: Executing inline script", {
      script,
      expression,
    });

    value = namespace.resolveExpression({
      __expression: expression,
    });

    logger.debug(
      "InnerInlineStateNamespaceProvider: Script executed successfully",
      {
        expression,
        value,
        varName,
      }
    );
  } catch (error) {
    logger.error(
      "InnerInlineStateNamespaceProvider: Error executing inline script",
      {
        error,
        script,
      }
    );
  }

  namespace.set(state.namespaceKey, value);
  if (varName) {
    namespace.set([varName], value);
    logger.debug(
      "InnerInlineStateNamespaceProvider: Set inline state with varName",
      {
        varName,
        value,
      }
    );
  }

  logger.debug(
    "InnerInlineStateNamespaceProvider: Inline state set in namespace",
    {
      namespaceKey: state.namespaceKey,
      value,
    }
  );

  return (
    <NamespaceContext.Provider value={namespace}>
      {children}
    </NamespaceContext.Provider>
  );
}

export function InlineStateNamespaceProvider({
  children,
  state,
}: PropsWithChildren<{
  state: InlineStateInstance;
}>) {
  logger.debug("Rendering InlineStateNamespaceProvider", { state });

  const script = useObservable(state.model.script$, state.model.script);
  const varName = useObservable(state.model.varName$, state.model.varName);

  logger.debug("InlineStateNamespaceProvider: Values resolved", {
    script,
    varName,
    hasScript: !!script,
  });

  if (!script) {
    logger.debug(
      "InlineStateNamespaceProvider: No script, rendering children directly"
    );
    return <>{children}</>;
  } else {
    return (
      <InnerInlineStateNamespaceProvider
        key={script}
        script={script}
        varName={varName}
        state={state}
      >
        {children}
      </InnerInlineStateNamespaceProvider>
    );
  }
}
